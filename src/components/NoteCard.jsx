import { useState } from "react"
import "../styles/NoteCard.css"

function NoteCard({ header, text, time, noteID, status }) {

    async function handleChangeNoteStatus() {
        const res = await fetch(`http://localhost:3000/notefication`);
        if (!res.ok) throw new Error("Server not found please try again");
        let notes = await res.json();

        let currentStatus = notes.filter(note => note.noteID === noteID);
        let otherNotes = notes.filter(note => note.noteID !== noteID);
        let nextCurrentStatus = { ...currentStatus[0], status: "read" };
        let uploadNotes = [...otherNotes, nextCurrentStatus];
        const patch = await fetch(`http://localhost:3000/notefication`, {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify(uploadNotes)
        })
        const newStatus = await patch.json()
    }

    function formatTime(dateString) {
        const date = new Date(dateString)

        return date.toLocaleString("en-EN", {
            day: "numeric",
            month: "long",
            hour: "2-digit",
            minute: "2-digit"
        })
    }
    return <div className="notification-card">
        <h2>{header}</h2>
        <p>{text}</p>
        <p>{formatTime(time)}</p>
        <button onClick={handleChangeNoteStatus}>{status}</button>
    </div>
}

export default NoteCard