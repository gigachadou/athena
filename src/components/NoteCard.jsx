import { useState } from "react"
import "../styles/NoteCard.css"

function NoteCard({ header, text, time, noteID, status }) {

   async function handleChangeNoteStatus() {
    try {
        const res = await fetch(`http://localhost:3000/notification?noteID=${noteID}`);
        if (!res.ok) throw new Error("Server not found please try again");

        const note = await res.json();

        const updatedNote = { ...note[0], status: "read" };

        const patch = await fetch(`http://localhost:3000/notification/${note[0].id}`, {
            method: "PATCH",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify(updatedNote)
        });

        if (!patch.ok) throw new Error("Failed to update note");

    } catch (err) {}
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
        <button onClick={handleChangeNoteStatus} disabled={status==="read"}>{status}</button>
    </div>
}

export default NoteCard