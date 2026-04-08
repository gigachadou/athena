# Athena 🌿

**Athena** is a student- and researcher-focused social platform where people connect to create **group projects**, collaborate on **research**, share scientific ideas, and post about daily life & thoughts.

This repository contains the frontend (with ready-to-use backend) code for Athena — currently built as a modern React application. The project starts with a clean Vite + React setup and will grow step-by-step with real features, better structure, authentication, real-time collaboration, and more.

The main goal of this project is:

- Build something **useful** for students and researchers
- Deepen understanding of **React**, state management & modern frontend patterns
- Learn full-stack development (API, database, auth, realtime later)
- Create clean, scalable & well-documented code
- Have fun while making a tool I (and hopefully others) actually use 🚀

## Tech Stack

- ⚡ **Vite** – blazing fast dev environment & build tool
- ⚛️ **React** – core UI library (with hooks & modern patterns)
- 🧱 **HTML / CSS / JavaScript** - Frontend
- **JSON-server** - Backend (temporarily);

## Installation

```bash
# clone this repository:
https://github.com/gigachadou/athena.git
```
```bash
# go to the file
cd athena
```
```bash
# install dependencies and modules
npm install
```
```bash
# create a db.json file in the folder with name 'backend' (there will be an example below)
# run
npm run dev
```
```bash
# run servers
npm run server
node src/backend/server.js
```

```json
//server watches "users" endpoint only, so name it correctly or change it in server.js!
{
   "users": [],
   "posts": [],
   "notifications": []
}
```

## Gatito wishes you luck!

   /\ /\
  ( -_- )
  /     \
 (  ___  )
  `-----'