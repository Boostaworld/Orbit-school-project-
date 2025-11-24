Here is the comprehensive feature specification for your "Squad Mode" architecture. This document serves as the "Source of Truth" for building these two core features.

🔮 Feature 1: "The Oracle" (Context-Aware Roasts)
Goal: Transform the AI from a generic tutor into a "member of the friend group" that uses peer pressure (data) to motivate the user.

1. The Core Logic (The "Roast" Engine)
The AI does not simply answer a question; it performs a Comparative Analysis before responding.

Trigger: User interacts with the "Orbit AI" button on a specific task or asks a query like "Can I skip this?", "How cooked am I?", or "Do I need to study?"

Data Pipeline (The 3-Step Scan):

Self-Scan (User Context):

Inputs: Current time, Task Due Date, Task Difficulty Tag (Quick/Grind/Cooked), User's historical completion rate for this subject.

Squad-Scan (Social Context):

Query: Fetch aggregated data from public.tasks where course_id matches AND user_id is in user.friends_list.

Metrics:

Completion Rate: % of friends who have marked this specific task as "Done".

Effort Estimate: Average time elapsed between "Started" and "Done" for friends.

Sentiment: Most common difficulty tag used by friends (e.g., if 3 friends tagged it "Cooked").

The Generation (Prompt Injection):

System Prompt: "You are a brutally honest peer. You have access to the user's social circle data. Compare the user's inaction to their friends' progress. Use Gen Z slang but keep it helpful."

Input Context: "User has done 0%. Friends (Sarah, Mike) are 100% done. Average time taken: 2 hours. Due date: Tomorrow 8 AM."

Output: "Look, I love you, but Sarah and Mike both spent 2 hours on this last night. If you start now, you're looking at a 2 AM finish. Don't play yourself."

2. The "SOS" Integration
If the Oracle calculates a high probability of failure (e.g., User Progress < 10% vs Squad Progress > 80% with < 12 hours remaining), it triggers the SOS Flow.

UI Trigger: The AI response includes a rendered button: [ POST SOS TO FEED ].

The Feed Card:

Visuals: A card with a pulsing red border in the "Network" tab.

Headline: "🚨 SOS: [User] is getting destroyed by [Subject]."

AI Summary: "They are 4 hours behind the squad average. Send notes immediately."

The Interaction ("Send Notes"):

Friends see a prominent "Upload Help" button on the card.

Action: Clicking it opens a file picker (Phone Camera or PDF).

Backend: Uploads file to Supabase Storage bucket orbit-notes and sends a DM link to the struggling user.

🛠️ Implementation Tips: "The Oracle"
1. Database Strategy (Supabase RPC):

Don't fetch every task from every friend in the client app. That's slow and insecure.

Tip: Write a Postgres Function (RPC) called get_squad_stats(course_name).

It calculates the averages/counts directly in the database and returns a lightweight JSON object: { completed_count: 3, avg_time_minutes: 120, dominant_tag: 'Cooked' }.

Call this function from your frontend before sending the prompt to Gemini.

2. Prompt Engineering:

Gemini needs to know who the friends are to sound authentic.

Tip: When constructing the prompt, pass the names of the friends who finished.

Bad: "Friends have finished."

Good: "Sarah and Mike have finished."

Safety: Ensure you strip any truly private data (like grades) before sending to the AI. Only send status (Done/Todo) and Tags.

3. Optimistic Updates:

When the user clicks "Post SOS", show the card immediately in their local feed before the network request finishes. This makes the app feel "instant."

🌌 Feature 2: "Orbit Trails" (The Ghost System)
Goal: Create a sense of community ("presence") without requiring users to be online at the exact same second.

1. The "Heatmap" Logic (Intensity Levels)
The dashboard visualizes last_active timestamps as visual "temperature."

The 4 Tiers of Presence:

Blazing (Live):

Condition: last_active < 15 mins.

Visual: Bright, high opacity, pulsing animation.

Meaning: "Join them now."

Warm (Recent):

Condition: 15 mins < last_active < 2 hours.

Visual: Solid glow, medium opacity, static.

Meaning: "They just finished up."

Fading (Echo):

Condition: 2 hours < last_active < 12 hours.

Visual: Faint, low opacity, "misty" blur effect.

Meaning: "The squad was active today."

Cold (Void):

Condition: last_active > 12 hours.

Visual: Invisible or dark grey placeholder.

Meaning: "Dead zone."

2. "Echoes" (Ephemeral Graffiti)
Small text artifacts left behind by users to add context to their "Trail."

Creation: When a user completes a task or logs off a subject, prompt: "Leave an Echo?"

Constraints: Max 60 characters. (e.g., "Ch. 4 is impossible", "Ez pz", "I'm crying").

Display:

Echoes "float" inside the Nebula cloud of that subject.

Hovering over the Nebula reveals the text and the author.

Lifecycle: Echoes automatically delete (or stop rendering) after 12 hours, keeping the board fresh.

🛠️ Implementation Tips: "Orbit Trails"
1. Data Persistence vs. Realtime:

Supabase Realtime is great for "Who is online now", but it doesn't remember who was online 1 hour ago once they disconnect.

Tip: You need a hybrid approach.

Table: public.activity_logs (columns: user_id, subject, last_active_timestamp, echo_text).

Action: When a user enters a subject/page, UPSERT (update or insert) their row in this table with NOW().

Fetching: The Dashboard fetches this table, not just the Realtime presence state, to render the "Fading" and "Warm" trails.

2. Frontend Animation (Framer Motion):

Don't use complex WebGL for the "Nebula" unless you are comfortable with it.

Tip: Use multiple div layers with CSS blur-3xl and rounded-full.

Layer 1 (Core): Small, bright color.

Layer 2 (Glow): Large, lower opacity.

Animate the opacity based on the time difference calculation ( Date.now() - last_active ).

3. The "Echo" Clean-Up:

You don't want old messages cluttering the DB.

Tip: You don't actually need to delete them instantly. Just filter them out in your Supabase query:

select * from activity_logs where last_active_timestamp > (now() - interval '12 hours')

This keeps the query fast and the UI clean without needing a complex cron job server-side.
