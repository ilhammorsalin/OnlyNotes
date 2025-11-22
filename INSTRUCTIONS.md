**System:** You are an expert Senior Frontend Engineer and UI/UX Designer specializing in mobile-first interactions, React, Tailwind CSS, and Framer Motion.

**Task:** Build a high-fidelity, functional prototype of a mobile web application called **"OnlyNotes"**. The app is a "Tinder for University Notes."

**Tech Stack:**
* React (Next.js App Router structure)
* Tailwind CSS (Styling)
* Framer Motion (Crucial for swipe physics and transitions)
* Lucide React (Icons)
* Shadcn UI (Components)

**Core Architecture: "Diamond Navigation"**
The app has a single viewport (mobile aspect ratio) with no traditional navbar. Navigation is entirely gesture-based from the Home Screen:
1.  **Swipe Up:** Transitions to the **Library View** (Grid of saved notes).
2.  **Swipe Down:** Transitions to the **Social View** (Leaderboard & Profile tabs).
3.  **Swipe Left (on Card):** Skips the current note.
4.  **Swipe Right (on Card):** Saves the note to Library.
5.  **Tap (on Card):** Expands into **Reading Mode**.

**Detailed Component Requirements:**

1.  **Home View (The Stack):**
    * Render a stack of cards using `AnimatePresence`.
    * Cards show: Topic tag (e.g., "Calculus"), Title, Author Avatar, and a short "Hook" summary.
    * Implement physics-based draggable cards (Tinder style).
    * Background should be clean/minimal to focus on the cards.

2.  **Reading Mode (The "Moat"):**
    * Triggered by tapping a card.
    * Opens a full-screen overlay.
    * **The Blur Mechanic:** Show the first 30% of the text clearly. The remaining 70% should be obscured by a heavy CSS blur gradient (`backdrop-blur-md`).
    * **Interaction:** When the user scrolls down past 200px, smoothly remove the blur (animate it out) and trigger a "Toast" notification that says "Unlocked & Upvoted!"
    * Swipe Down on the header to close Reading Mode.

3.  **Library View (Top Screen):**
    * Accessed by swiping the whole screen Up.
    * Contains a Search Bar and a Masonry Grid of "Saved" cards.
    * Include a "Back to Home" swipe indicator at the bottom.

4.  **Social View (Bottom Screen):**
    * Accessed by swiping the whole screen Down.
    * Use Tabs to switch between **"Leaderboard"** and **"Profile"**.
    * **Leaderboard:** List top 10 users with "Gold/Silver/Bronze" styling for top 3. Rank by "Total Upvotes."
    * **Profile:** User avatar, stats (Earnings, Notes Posted), and a button to "Upload Note."

**Mock Data:**
* Create a `dummyNotes` array with realistic university topics (Computer Science, History, Physics) to populate the app.

**Visual Style:**
* Modern, "Dark Mode" aesthetic (Slate/Zinc palette).
* Accent color: Indigo/Violet (for the "Premium" feel).
* Typography: Sans-serif, clean and readable.
* **Important:** Ensure all animations (swipes between screens and card dismissals) are smooth and springy using Framer Motion.

**Output:**
Generate the complete code in a single response if possible, or structured clearly into components. Focus on making the "Swipe" interactions feel real.