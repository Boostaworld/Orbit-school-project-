
import { create } from 'zustand';
import { Task, ChatMessage, UserProfile, IntelDrop } from '../types';
import { generateOracleRoast, assessTaskDifficulty } from '../lib/ai/gemini';
import { runIntelQuery, IntelResult } from '../lib/ai/intel';
import { supabase } from '../lib/supabase';

interface OrbitState {
  // Auth State
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  currentUser: UserProfile | null;

  // App State
  tasks: Task[];
  oracleHistory: ChatMessage[];
  isOracleThinking: boolean;

  // Intel State
  intelDrops: IntelDrop[];
  isIntelLoading: boolean;
  currentIntelResult: IntelResult | null;

  // Initialization
  initialize: () => Promise<void>;

  // Auth Actions
  login: (email: string, pass: string) => Promise<{ success: boolean, error?: string }>;
  register: (email: string, pass: string, username: string) => Promise<{ success: boolean, error?: string }>;
  logout: () => Promise<void>;

  // Data Actions
  addTask: (task: Partial<Task>) => Promise<void>;
  toggleTask: (id: string, currentStatus: boolean) => Promise<void>;
  forfeitTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>; // Admin-only deletion
  askOracle: (query: string) => Promise<void>;
  triggerSOS: () => void;

  // Intel Actions
  executeIntelQuery: (query: string, deepDive?: boolean) => Promise<void>;
  saveIntelDrop: (query: string, isPrivate: boolean) => Promise<void>;
  publishManualDrop: (title: string, content: string, tags?: string[]) => Promise<void>;
  deleteIntelDrop: (id: string) => Promise<void>; // Admin-only deletion
  fetchIntelDrops: () => Promise<void>;
}

export const useOrbitStore = create<OrbitState>((set, get) => ({
  isAuthenticated: false,
  isAuthLoading: true,
  currentUser: null,
  tasks: [],
  oracleHistory: [
    { id: 'init', role: 'model', text: "Orbit Link established. Database connected. Waiting for input.", timestamp: new Date() }
  ],
  isOracleThinking: false,
  intelDrops: [],
  isIntelLoading: false,
  currentIntelResult: null,

  // --- INITIALIZATION & REALTIME ---
  initialize: async () => {
    try {
      // 1. Check Session
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) throw error;

      if (session?.user) {
        // Fetch Profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        // Fetch Tasks
        const { data: tasks } = await supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: true });

        // Map DB Profile to App Type
        const mappedUser: UserProfile = profile ? {
          id: profile.id,
          username: profile.username,
          avatar: profile.avatar_url,
          joinedAt: new Date().toISOString(), // Using now as fallback
          isAdmin: profile.is_admin || false,
          stats: {
            tasksCompleted: profile.tasks_completed || 0,
            tasksForfeited: profile.tasks_forfeited || 0,
            streakDays: 0
          }
        } : null;

        set({
          isAuthenticated: true,
          currentUser: mappedUser,
          tasks: tasks || []
        });

        // Fetch Intel Drops
        await get().fetchIntelDrops();

        // 2. Setup Realtime Task Listeners (Sync across devices)
        supabase.channel('public:tasks')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${session.user.id}` }, (payload: any) => {
            const currentTasks = get().tasks;
            if (payload.eventType === 'INSERT') {
              set({ tasks: [...currentTasks, payload.new as Task] });
            } else if (payload.eventType === 'UPDATE') {
              set({ tasks: currentTasks.map(t => t.id === payload.new.id ? payload.new as Task : t) });
            } else if (payload.eventType === 'DELETE') {
              set({ tasks: currentTasks.filter(t => t.id !== payload.old.id) });
            }
          })
          .subscribe();

        // 3. Setup Realtime Intel Drop Listeners
        supabase.channel('public:intel_drops')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'intel_drops' }, (payload: any) => {
            const currentDrops = get().intelDrops;
            if (payload.eventType === 'INSERT') {
              // Fetch full drop with profile data
              get().fetchIntelDrops();
            } else if (payload.eventType === 'DELETE') {
              set({ intelDrops: currentDrops.filter(d => d.id !== payload.old.id) });
            }
          })
          .subscribe();
      }
    } catch (error) {
      console.warn("Orbit Init Warning: Supabase disconnected or unconfigured.", error);
      // We intentionally suppress the error here so the UI can load the Login Screen
      // instead of white-screening.
    } finally {
      set({ isAuthLoading: false });
    }
  },

  // --- AUTH ACTIONS ---
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };

    await get().initialize(); // Re-run init to fetch data
    return { success: true };
  },

  register: async (email, password, username) => {
    // Sign up creates the auth user. 
    // The SQL Trigger we wrote creates the 'profiles' row automatically.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username } // Passed to the trigger
      }
    });

    if (error) return { success: false, error: error.message };

    await get().initialize();
    return { success: true };
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({
      isAuthenticated: false,
      currentUser: null,
      tasks: [],
      intelDrops: [],
      currentIntelResult: null
    });
  },

  // --- DATA ACTIONS ---
  addTask: async (task) => {
    const { currentUser } = get();
    if (!currentUser) return;

    // 1. Optimistic Update (Show it immediately)
    const tempId = 'temp-' + Date.now();
    const optimisticTask: Task = {
      id: tempId,
      title: task.title || 'New Task',
      category: task.category || 'Grind',
      difficulty: task.difficulty || 'Medium',
      completed: false,
      isAnalyzing: !task.difficulty // Only show analyzing if we need AI
    };
    set((state) => ({ tasks: [...state.tasks, optimisticTask] }));

    // 2. AI Analysis if difficulty not manually set
    let difficulty = task.difficulty;
    if (!difficulty) {
      const analysis = await assessTaskDifficulty(optimisticTask.title);
      difficulty = analysis.difficulty;
    }

    // 3. DB Insert
    const { data, error } = await supabase.from('tasks').insert({
      user_id: currentUser.id,
      title: optimisticTask.title,
      category: optimisticTask.category,
      difficulty: difficulty,
      completed: false
    }).select().single();

    // 4. Reconcile Optimistic Task with Real DB Task
    if (data && !error) {
      set((state) => ({
        tasks: state.tasks.map(t => t.id === tempId ? data as Task : t)
      }));
    }
  },

  toggleTask: async (id, currentStatus) => {
    // Optimistic
    set(state => ({
      tasks: state.tasks.map(t => t.id === id ? { ...t, completed: !currentStatus } : t)
    }));

    // DB Update
    const { error } = await supabase.from('tasks').update({ completed: !currentStatus }).eq('id', id);

    // Update Profile Stats if completing
    if (!error && !currentStatus) {
      await supabase.rpc('increment_completed_tasks', { user_id_arg: get().currentUser?.id });
      // (Note: You can add a simple RPC function in SQL or just perform a raw update on profiles)
      // For simplicity, raw update:
      const user = get().currentUser;
      if (user) {
        const newCount = user.stats.tasksCompleted + 1;
        await supabase.from('profiles').update({ tasks_completed: newCount }).eq('id', user.id);
        set(state => state.currentUser ? ({
          currentUser: { ...state.currentUser, stats: { ...state.currentUser.stats, tasksCompleted: newCount } }
        }) : {});
      }
    }
  },

  forfeitTask: async (id) => {
    const { currentUser } = get();
    if (!currentUser) return;

    // Optimistic Delete
    set(state => ({ tasks: state.tasks.filter(t => t.id !== id) }));

    // DB Delete
    await supabase.from('tasks').delete().eq('id', id);

    // Update Shame Stats
    const newCount = currentUser.stats.tasksForfeited + 1;
    await supabase.from('profiles').update({ tasks_forfeited: newCount }).eq('id', currentUser.id);
    set(state => state.currentUser ? ({
      currentUser: { ...state.currentUser, stats: { ...state.currentUser.stats, tasksForfeited: newCount } }
    }) : {});
  },

  deleteTask: async (id) => {
    // Admin-only deletion (no stat penalty)
    // Optimistic Delete
    set(state => ({ tasks: state.tasks.filter(t => t.id !== id) }));

    // DB Delete
    await supabase.from('tasks').delete().eq('id', id);
  },

  askOracle: async (query) => {
    const { tasks, oracleHistory, currentUser } = get();
    if (!currentUser) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: query, timestamp: new Date() };
    const updatedHistory = [...oracleHistory, userMsg];

    set({ oracleHistory: updatedHistory, isOracleThinking: true });

    const completedCount = tasks.filter(t => t.completed).length;

    const aiResponseText = await generateOracleRoast(
      updatedHistory,
      completedCount,
      currentUser.stats.tasksForfeited
    );

    const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: aiResponseText, timestamp: new Date() };
    set({ oracleHistory: [...updatedHistory, aiMsg], isOracleThinking: false });
  },

  triggerSOS: () => {
    const { oracleHistory } = get();
    const sosMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'model',
      text: "🚨 SOS BROADCASTED. ALL OPERATIVES ALERTED.",
      timestamp: new Date(),
      isSOS: true
    };
    set({ oracleHistory: [...oracleHistory, sosMsg] });
  },

  // --- INTEL ACTIONS ---
  executeIntelQuery: async (query: string, deepDive: boolean = false) => {
    const { currentUser } = get();
    if (!currentUser) return;

    set({ isIntelLoading: true, currentIntelResult: null });

    try {
      // Get user's custom intel instructions from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('intel_instructions')
        .eq('id', currentUser.id)
        .single();

      const customInstructions = profile?.intel_instructions || undefined;

      const result = await runIntelQuery(query, customInstructions, deepDive);
      set({ currentIntelResult: result, isIntelLoading: false });
    } catch (error: any) {
      console.error('Intel Query Error:', error);
      set({ isIntelLoading: false });
      throw error;
    }
  },

  saveIntelDrop: async (query: string, isPrivate: boolean) => {
    const { currentUser, currentIntelResult } = get();
    if (!currentUser || !currentIntelResult) return;

    const { data, error } = await supabase
      .from('intel_drops')
      .insert({
        author_id: currentUser.id,
        query: query,
        summary_bullets: currentIntelResult.summary_bullets,
        sources: currentIntelResult.sources,
        related_concepts: currentIntelResult.related_concepts,
        essay: currentIntelResult.essay,
        is_private: isPrivate
      })
      .select()
      .single();

    if (error) throw error;

    // Clear current result after saving
    set({ currentIntelResult: null });
  },

  fetchIntelDrops: async () => {
    const { currentUser } = get();
    if (!currentUser) return;

    // Fetch public drops + my private drops
    const { data, error } = await supabase
      .from('intel_drops')
      .select(`
        *,
        profiles!intel_drops_author_id_fkey (
          username,
          avatar_url
        )
      `)
      .or(`is_private.eq.false,author_id.eq.${currentUser.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch Intel Drops Error:', error);
      return;
    }

    // Map to IntelDrop type with author info
    const mappedDrops: IntelDrop[] = (data || []).map((drop: any) => ({
      id: drop.id,
      author_id: drop.author_id,
      author_username: drop.profiles?.username,
      author_avatar: drop.profiles?.avatar_url,
      query: drop.query,
      summary_bullets: drop.summary_bullets,
      sources: drop.sources,
      related_concepts: drop.related_concepts,
      essay: drop.essay,
      is_private: drop.is_private,
      created_at: drop.created_at
    }));

    set({ intelDrops: mappedDrops });
  },

  publishManualDrop: async (title: string, content: string, tags: string[] = []) => {
    const { currentUser } = get();
    if (!currentUser) return;

    // Create a manual drop by structuring the content
    const { data, error } = await supabase
      .from('intel_drops')
      .insert({
        author_id: currentUser.id,
        query: title,
        summary_bullets: [content], // Treat the main content as a single bullet point or summary
        sources: [],
        related_concepts: ['Manual Broadcast', ...tags],
        is_private: false // Manual posts are usually public transmissions
      })
      .select()
      .single();

    if (error) throw error;

    // Refresh the feed
    await get().fetchIntelDrops();
  },

  deleteIntelDrop: async (id: string) => {
    // Optimistic Update
    const currentDrops = get().intelDrops;
    set({ intelDrops: currentDrops.filter(d => d.id !== id) });

    const { error } = await supabase.from('intel_drops').delete().eq('id', id);
    if (error) {
      console.error("Failed to delete drop:", error);
      // Revert on error
      set({ intelDrops: currentDrops });
    }
  }
}));
