# SYSTEM INSTRUCTION: PROJECT ORBIT CONTEXT

**Role:** You are the Lead Full-Stack Architect and Product Manager for "Orbit."
**Project:** Orbit (A Student Task Manager & Dashboard).
**Current State:** Fully functional Single-File HTML/JS Prototype.
**Future State:** Scalable React/Next.js Application with Supabase Database.
**Target Audience:** High school students who procrastinate/struggle with organization.
**Tone:** "Gen Z Professional." Dark mode, sleek, slightly gamified, empathetic to laziness.

---

## 1. THE "LAZY GENIUS" PHILOSOPHY
We are building this for students who don't want to manually enter data.
1.  **Horde Mode:** Eventually, students shouldn't type assignments. One person enters it, everyone interacts.
2.  **Visual Urgency:** We use red/orange pulsing lights for deadlines < 24h.
3.  **Gamification:** Confetti on completion. "Orbit Points" (planned).
4.  **Social Pressure:** The "Network" tab (planned) will show others working to encourage "body doubling."

---

## 2. THE CURRENT PROTOTYPE (Source of Truth)
This is the working prototype code. All future React/Next.js iterations must replicate the functionality and visual style (Glassmorphism + Space Theme) found here:

```html
<!-- ORBIT PROTOTYPE V2: Auto-Schedule & Sidebar Included -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Orbit | Student Command Center</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&display=swap');
        body { font-family: 'Inter', sans-serif; background: #020617; color: white; overflow-x: hidden; }
        .bg-orb { position: fixed; border-radius: 50%; filter: blur(100px); z-index: -1; opacity: 0.4; }
        .orb-1 { top: -10%; left: -10%; width: 50vw; height: 50vw; background: #4f46e5; }
        .orb-2 { bottom: -10%; right: -10%; width: 40vw; height: 40vw; background: #0891b2; }
        .glass-panel { background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08); }
        .glass-sidebar { background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(20px); border-right: 1px solid rgba(255, 255, 255, 0.08); }
        .glass-input { background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 255, 255, 0.1); color: white; }
        .nav-item.active { background: rgba(56, 189, 248, 0.15); color: #38bdf8; border-right: 3px solid #38bdf8; }
        .tab-content { display: none; animation: fadeIn 0.3s ease; }
        .tab-content.active { display: block; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .pulse-text { animation: pulse-slate 2s infinite; }
        @keyframes pulse-slate {
            0%, 100% { opacity: 1; text-shadow: 0 0 10px rgba(56, 189, 248, 0.5); }
            50% { opacity: 0.7; text-shadow: 0 0 0px rgba(56, 189, 248, 0); }
        }
    </style>
</head>
<body class="flex h-screen">
    <!-- SIDEBAR -->
    <aside class="w-20 md:w-64 h-full glass-sidebar flex flex-col fixed md:relative z-20 transition-all duration-300">
        <div class="p-6 flex items-center gap-3">
            <div class="w-8 h-8 bg-cyan-500 rounded flex items-center justify-center shadow-lg shadow-cyan-500/30"><i class="fa-solid fa-meteor text-white text-sm"></i></div>
            <h1 class="font-extrabold text-xl tracking-tight hidden md:block">Orbit</h1>
        </div>
        <nav class="flex-1 mt-6 space-y-2">
            <button onclick="switchTab('dashboard')" id="nav-dashboard" class="nav-item active w-full p-4 flex items-center gap-4 text-slate-400 hover:text-white hover:bg-white/5 transition-all"><i class="fa-solid fa-layer-group text-lg w-6 text-center"></i><span class="font-medium hidden md:block">Dashboard</span></button>
            <button onclick="switchTab('schedule')" id="nav-schedule" class="nav-item w-full p-4 flex items-center gap-4 text-slate-400 hover:text-white hover:bg-white/5 transition-all"><i class="fa-solid fa-calendar-day text-lg w-6 text-center"></i><span class="font-medium hidden md:block">My Schedule</span></button>
            <button onclick="switchTab('network')" id="nav-network" class="nav-item w-full p-4 flex items-center gap-4 text-slate-400 hover:text-white hover:bg-white/5 transition-all"><i class="fa-solid fa-comments text-lg w-6 text-center"></i><span class="font-medium hidden md:block">The Network</span><span class="hidden md:inline-block ml-auto text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">SOON</span></button>
        </nav>
        <div class="p-4 hidden md:block"><div class="glass-panel rounded-xl p-4 text-center"><p class="text-xs text-slate-400 uppercase mb-1">Current Time</p><div id="sidebar-clock" class="font-mono font-bold text-xl">--:--</div></div></div>
    </aside>
    <!-- MAIN CONTENT -->
    <main class="flex-1 h-full overflow-y-auto p-4 md:p-8 relative z-10 ml-20 md:ml-0">
        <!-- DASHBOARD TAB -->
        <section id="dashboard" class="tab-content active max-w-5xl mx-auto">
            <div class="glass-panel rounded-2xl p-6 md:p-8 mb-8 relative overflow-hidden group">
                <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition"><i class="fa-solid fa-clock text-9xl text-white"></i></div>
                <div class="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div><h2 class="text-sm text-cyan-400 font-bold uppercase tracking-widest mb-1">Current Status</h2><div id="period-name" class="text-3xl md:text-5xl font-black text-white leading-tight">Loading...</div><p id="period-subtext" class="text-slate-400 mt-2">Check 'My Schedule' to set times.</p></div>
                    <div class="text-left md:text-right"><div id="period-timer" class="text-4xl md:text-6xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500 pulse-text">--:--:--</div><div id="period-label" class="text-sm font-bold text-slate-500 uppercase mt-1">Until Next Event</div></div>
                </div>
                <div class="w-full bg-slate-800 h-1.5 mt-6 rounded-full overflow-hidden"><div id="period-progress" class="h-full bg-cyan-500 transition-all duration-1000" style="width: 0%"></div></div>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div class="lg:col-span-1"><div class="glass-panel rounded-xl p-6 sticky top-6"><h3 class="font-bold text-lg mb-4"><i class="fa-solid fa-plus text-cyan-400 mr-2"></i>Add Assignment</h3><form id="taskForm" class="space-y-4"><div><input type="text" id="title" placeholder="Assignment Name" class="glass-input w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm" required></div><div><input type="text" id="course" placeholder="Class" class="glass-input w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm" required></div><div class="grid grid-cols-2 gap-2"><input type="date" id="dueDate" class="glass-input w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm [color-scheme:dark]" required><input type="time" id="dueTime" class="glass-input w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm [color-scheme:dark]" required></div><button type="submit" class="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg shadow-lg active:scale-95">Add to Queue</button></form></div></div>
                <div class="lg:col-span-2"><div class="flex justify-between items-center mb-4"><h3 class="font-bold text-xl">Your Workload</h3><span id="task-count" class="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-slate-400">0 Tasks</span></div><div id="taskList" class="space-y-3"></div><div id="emptyState" class="hidden py-12 text-center border-2 border-dashed border-slate-800 rounded-xl"><p class="text-slate-500">No active assignments.</p></div></div>
            </div>
        </section>
        <!-- SCHEDULE TAB -->
        <section id="schedule" class="tab-content max-w-4xl mx-auto"><div class="mb-8"><h2 class="text-3xl font-bold mb-2">Bell Schedule Config</h2></div><div class="glass-panel rounded-xl p-6"><form id="scheduleForm"><div id="schedule-rows" class="space-y-3 mb-6"></div><div class="flex gap-4"><button type="button" onclick="addScheduleRow()" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm font-bold">+ Add Period</button><button type="submit" class="px-6 py-2 bg-green-600 hover:bg-green-500 rounded text-sm font-bold ml-auto">Save Schedule</button></div></form></div></section>
        <!-- NETWORK TAB -->
        <section id="network" class="tab-content max-w-4xl mx-auto h-full flex flex-col items-center justify-center text-center pt-20"><div class="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(147,51,234,0.5)] mb-6 animate-bounce"><i class="fa-solid fa-comment-dots text-4xl text-white"></i></div><h2 class="text-4xl font-bold text-white mb-2">The Network</h2><p class="text-purple-300 text-lg max-w-md">Chat/Social features coming next.</p></section>
    </main>
    <script>
        function switchTab(id){document.querySelectorAll('.tab-content').forEach(el=>el.classList.remove('active'));document.querySelectorAll('.nav-item').forEach(el=>el.classList.remove('active'));document.getElementById(id).classList.add('active');document.getElementById('nav-'+id).classList.add('active');}
        const defaultSchedule=[{name:"Period 1",start:"08:00",end:"08:50"},{name:"Period 2",start:"08:54",end:"09:44"},{name:"Lunch",start:"11:30",end:"12:15"}];
        let schedule=JSON.parse(localStorage.getItem('orbitSchedule'))||defaultSchedule;
        function renderScheduleInputs(){const c=document.getElementById('schedule-rows');c.innerHTML='';schedule.forEach((p,i)=>{const d=document.createElement('div');d.className='flex gap-2 items-center group';d.innerHTML=`<input type="text" value="${p.name}" class="sched-name glass-input flex-1 p-2 rounded"><input type="time" value="${p.start}" class="sched-start glass-input w-24 p-2 rounded"><span class="text-slate-500">-</span><input type="time" value="${p.end}" class="sched-end glass-input w-24 p-2 rounded"><button type="button" onclick="removeScheduleRow(${i})" class="text-red-500 px-2 group-hover:opacity-100 opacity-0"><i class="fa-solid fa-trash"></i></button>`;c.appendChild(d);});}
        function addScheduleRow(){schedule.push({name:"New Period",start:"12:00",end:"13:00"});renderScheduleInputs();}
        function removeScheduleRow(i){if(confirm('Delete?')){schedule.splice(i,1);renderScheduleInputs();}}
        document.getElementById('scheduleForm').addEventListener('submit',(e)=>{e.preventDefault();const r=document.getElementById('schedule-rows').children;const n=[];for(let row of r){n.push({name:row.querySelector('.sched-name').value,start:row.querySelector('.sched-start').value,end:row.querySelector('.sched-end').value});}n.sort((a,b)=>a.start.localeCompare(b.start));schedule=n;localStorage.setItem('orbitSchedule',JSON.stringify(schedule));alert('Saved');updateClassStatus();});
        function parseTime(s){const[h,m]=s.split(':').map(Number);const d=new Date();d.setHours(h,m,0,0);return d;}
        function updateClassStatus(){const now=new Date();const periods=schedule.map(p=>({name:p.name,start:parseTime(p.start),end:parseTime(p.end)}));let cur=null,tar=null,st="",sub="";for(let i=0;i<periods.length;i++){const p=periods[i];const pn=periods[i+1];if(now>=p.start&&now<p.end){cur=p;st=p.name;sub="Class in session";tar=p.end;break;}if(pn&&now>=p.end&&now<pn.start){st="Passing Period";sub="Next: "+pn.name;tar=pn.start;cur={start:p.end,end:pn.start};break;}}if(!tar){if(periods.length>0&&now<periods[0].start){st="Before School";tar=periods[0].start;}else{st="After School";document.getElementById('period-timer').innerText="RELAX";document.getElementById('period-progress').style.width="0%";return;}}document.getElementById('period-name').innerText=st;document.getElementById('period-subtext').innerText=sub;const diff=tar-now;const h=Math.floor(diff/3600000),m=Math.floor((diff%3600000)/60000),s=Math.floor((diff%60000)/1000);document.getElementById('period-timer').innerText=`${h}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;if(cur){const tot=cur.end-cur.start,el=now-cur.start;document.getElementById('period-progress').style.width=`${(el/tot)*100}%`;}}
        let tasks=JSON.parse(localStorage.getItem('orbitTasks'))||[];
        function uuidv4(){return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0;return(c=='x'?r:(r&0x3|0x8)).toString(16);});}
        document.getElementById('taskForm').addEventListener('submit',(e)=>{e.preventDefault();tasks.push({id:uuidv4(),title:document.getElementById('title').value,course:document.getElementById('course').value,dueDateTime:new Date(document.getElementById('dueDate').value+'T'+document.getElementById('dueTime').value).getTime(),status:'todo'});saveAndRender();e.target.reset();});
        function saveAndRender(){localStorage.setItem('orbitTasks',JSON.stringify(tasks));renderTasks();}
        window.toggleStatus=function(id){const t=tasks.find(x=>x.id===id);if(!t)return;t.status=t.status==='todo'?'started':t.status==='started'?'done':'todo';if(t.status==='done')confetti();saveAndRender();}
        window.deleteTask=function(id){if(confirm('Delete?')){tasks=tasks.filter(x=>x.id!==id);saveAndRender();}}
        function renderTasks(){const l=document.getElementById('taskList');l.innerHTML='';tasks.sort((a,b)=>(a.status==='done')-(b.status==='done')||a.dueDateTime-b.dueDateTime);document.getElementById('task-count').innerText=tasks.length+" Tasks";if(!tasks.length)document.getElementById('emptyState').style.display='block';else document.getElementById('emptyState').style.display='none';tasks.forEach(t=>{const done=t.status==='done',now=Date.now(),left=t.dueDateTime-now;let bc='border-slate-600';if(!done){if(left<0)bc='border-red-600';else if(left<86400000)bc='border-orange-500';else bc='border-green-500';}l.innerHTML+=`<div class="glass-panel p-4 rounded-lg flex justify-between items-center border-l-4 ${bc} ${done?'opacity-50':''}"><div class="flex-1"><h4 class="font-bold text-white ${done?'line-through':''}">${t.title}</h4><div class="text-xs text-cyan-400 font-bold">${t.course}</div></div><div class="text-right"><div class="font-mono font-bold task-timer" data-due="${t.dueDateTime}" data-done="${done}">--</div><div class="flex gap-2 justify-end mt-2"><button onclick="toggleStatus('${t.id}')" class="text-[10px] bg-slate-700 px-2 rounded">${t.status.toUpperCase()}</button><button onclick="deleteTask('${t.id}')"><i class="fa-trash"></i></button></div></div></div>`;});updateTimers();}
        function updateTimers(){document.querySelectorAll('.task-timer').forEach(e=>{if(e.dataset.done==='true'){e.innerText="DONE";return;}const diff=parseInt(e.dataset.due)-Date.now();if(diff<0)e.innerText="OVERDUE";else if(diff>86400000)e.innerText=Math.ceil(diff/86400000)+"d";else e.innerText=Math.floor(diff/3600000)+"h "+Math.floor((diff%3600000)/60000)+"m";});}
        setInterval(()=>{document.getElementById('sidebar-clock').innerText=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});updateClassStatus();updateTimers();},1000);
        renderScheduleInputs();renderTasks();updateClassStatus();
    </script>
</body>
</html>```

3. IMPLEMENTATION ROADMAP
I need you to help me transition this to a scalable stack.
Selected Stack:
Frontend: Next.js (App Router), TypeScript, Tailwind CSS.
Backend/DB: Supabase (PostgreSQL + Auth + Realtime).
State: Zustand.
Icons: Lucide-React.
Phase 1 Execution (Immediate Goal):
Convert the single-file HTML above into a structured Next.js project.
components/BellTimer.tsx (Logic for period calculation).
components/TaskCard.tsx (Visual component for tasks).
hooks/useOrbitStore.ts (Zustand store for state).
4. DESIGN GUIDELINES (UI/UX)
Theme: "Dark Mode Space Glass."
Colors: Slate 900 Background. Cyan/Blue accents for primary actions. Purple for "Network/Social".
Feedback: Do not ask user to refresh. Use Optimistic UI updates. Confetti on success is mandatory.
Responsiveness: Must work perfectly on mobile (students use phones in class).
ACTION:
Please acknowledge you have received the context and are ready to continue acting as the Lead Developer for project Orbit.
