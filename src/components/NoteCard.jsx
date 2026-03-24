import "../styles/NoteCard.css"

function NoteCard({ header, text, time, noteID, status , id}) {

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

        } catch (err) { }
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

    async function handleDeleteNote() {
        try {
            const res = await fetch(`http://localhost:3000/notification/${id}` , {
                method:"DELETE"
            })
            if(!res.ok) throw new Error("not found server please try again later")
        } catch (error) { }
    }
    return <div className="notification-card">
        <h2>{header}</h2>
        <p>{text}</p>
        <p>{formatTime(time)}</p>
        <div className="note-buttons">
            <button onClick={handleChangeNoteStatus} disabled={status === "read"}>{status}</button>
            <button onClick={handleDeleteNote} disabled={status !== "read"}>Delete</button>
        </div>
    </div>
}

export default NoteCard