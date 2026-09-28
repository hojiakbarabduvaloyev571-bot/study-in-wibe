# Study in Wibe

A study community website for **school and university students and their teachers**.
Post the problem you're stuck on, find someone who knows the subject, chat with them, join subject clubs, and plan your exams.

---

## Table of contents

1. [Quick start](#quick-start)
2. [Features](#features)
3. [How to use it](#how-to-use-it)
4. [How the exam planner works](#how-the-exam-planner-works)
5. [Where your data is saved](#where-your-data-is-saved)
6. [Known limitations](#known-limitations)
7. [Tech stack](#tech-stack)
8. [Project files](#project-files)
9. [Troubleshooting](#troubleshooting)
10. [Roadmap](#roadmap)

---

## Quick start

No installation, no build step, no server.

1. Download `study-in-wibe.html`.
2. Double-click it to open it in a modern browser (Chrome, Edge, Firefox or Safari).
3. Create your profile and start using the site.

An internet connection is only needed to load the fonts. Without it, the site still works using default fonts.

---

## Features

| Feature | What it does |
|---|---|
| **Profiles** | Choose your role (student or teacher/tutor), your level (school or university), the subjects you know or want help with, and a short bio. |
| **Problem board** | Post a problem with a title, subject, level and description. Attach a **photo or video**. Others can reply, and you can mark it solved. |
| **School / University separation** | Posts, clubs and people can be filtered by school or university. |
| **Find someone** | Search teachers and students by subject, name, role or level. Message anyone from their card. |
| **Clubs** | Create or join subject clubs (School, University or both). Each club has its own discussion where members can send text, photos and videos. |
| **Chat** | Direct messages with photo and video attachments. |
| **Live camera** | A call-style window that opens your camera, with mic and camera on/off buttons (see [Known limitations](#known-limitations)). |
| **Focus timer** | Pomodoro timer (25 or 50 min focus, 5 or 15 min break) that counts your completed sessions. |
| **Exam planner** | Enter an exam date, topics and study hours per day, and get a day-by-day plan with a countdown and checkboxes. |
| **Backup** | Export all your data to a JSON file and import it later. |

Chat, Clubs, Find someone and the Problem board are separate tabs, so searching for people and searching by topic never mix with chatting.

---

## How to use it

### First time
1. Enter your name.
2. Choose **Student** or **Teacher / Tutor**.
3. Choose **School** or **University**.
4. Pick your subjects (or add your own) and write an optional bio.
5. Click **Enter**.

### Post a problem
1. Open **Problem board** and click **+ Post a problem**.
2. Fill in the title, subject, level and description.
3. Optionally attach a photo or video (up to 15 MB).
4. Click **Post problem**. Others can open the post to reply.

### Find a teacher or student
1. Open **Find someone**.
2. Type a subject or name, and filter by role or level.
3. Click **Message** on a person's card to start a chat.

### Use clubs
1. Open **Clubs** and search or filter by subject and level.
2. Click a club to see its members and discussion.
3. **Join club** to post messages, photos and videos.
4. Click **+ Create a club** to start your own.

### Plan for an exam
1. Open **Exam planner** and click **+ New exam plan**.
2. Enter the exam name and date.
3. Add your topics one by one.
4. Set how many hours per day you can study.
5. Click **Generate plan**, then open the plan and tick topics as you finish them.

### Focus
Open **Focus timer**, choose a session length, and press **Start**. Completed focus sessions are counted in your stats.

---

## How the exam planner works

The planner is a **rule-based scheduler** (it is not a machine-learning model). It follows spaced-repetition ideas:

1. It counts the days from today to the exam date.
2. It decides how many topics fit in each day from your daily study hours (about 48 minutes per topic).
3. Each topic is **learned** once, then scheduled for a **review** about three days later.
4. The **last day** is a full review of every topic.
5. If there are more topics than days, the extra topics are packed into a catch-up day.

---

## Where your data is saved

Everything is stored in your browser's **local storage** on your device. Nothing is sent to a server.

- Your profile, posts, replies, chats, clubs, focus sessions and exam plans are saved automatically.
- Use **Export backup** and **Import backup** in the left menu to move your data to another browser or device.
- **My profile → Erase all local data** deletes everything.

---

## Known limitations

This is a working prototype that runs entirely in the browser, so some things are simulated or limited:

- **No shared data between users.** Posts, chats and clubs are only visible on the device where they were created. Real multi-user use needs a backend server and database.
- **The people directory is sample data.** The teachers and students in "Find someone", the starter posts and the starter clubs are examples built into the file.
- **Chat replies are simulated.** After you send a direct message, a short automatic reply appears so the demo feels alive.
- **Live camera is a preview only.** It shows your own camera. Connecting two different people in a real video call requires a signaling server, which this file does not have.
- **Storage size.** Photos and videos are saved inside browser storage, which is usually limited to a few megabytes. Many or large uploads can fill it up. Uploads are limited to 15 MB each.
- **No accounts or passwords.** Anyone using the same browser sees the same data.

---

## Tech stack

- HTML, CSS and vanilla JavaScript (no frameworks, no build tools)
- Browser `localStorage` for saving data
- `FileReader` for photo and video uploads
- `getUserMedia` (browser camera and microphone API) for the live camera window
- Google Fonts: Fraunces and Public Sans

---

## Project files

```
study-in-wibe.html      The whole website (HTML + CSS + JavaScript in one file)
study-in-wibe.pptx  Presentation about the project
README.md           This file
```

Inside `study-in-wibe.html`, the JavaScript is organized in labeled sections: data layer, onboarding, navigation, problem board, find someone, clubs, chat, focus timer, exam planner, profile, live camera, and backup.

---

## Troubleshooting

**The camera doesn't open.**
Allow camera and microphone access when the browser asks. If the browser blocks it for local files, run a tiny local server from the folder and open the address it prints:

```
python3 -m http.server 8000
```

then visit `http://localhost:8000/study-in-wibe.html`.

**My uploads or data disappeared.**
Browser storage may have been cleared, or you are using a different browser or private window. Use **Export backup** regularly.

**A video or photo won't upload.**
The file may be over 15 MB. Choose a smaller file.

**The fonts look different.**
The fonts load from the internet. Offline, the site uses your system's default fonts.

---

## Roadmap

- Real accounts and a shared database, so everyone sees the same board, clubs and chats
- True live video calls between users
- A real AI model for smarter, personalized study plans
- Notifications and a mobile app
- Moderation tools for teachers and club owners
