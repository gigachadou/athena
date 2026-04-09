import "../styles/NoteCard.css"
import { supabase } from "../utils/supabaseClient";

function NoteCard({ header, text, time, noteID, status , id}) {

    async function handleChangeNoteStatus() {
        try {
            const { error } = await supabase
                .from('notification')
                .update({ status: 'read' })
                .eq('id', id);

            if (error) throw error;

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
            const { error } = await supabase
                .from('notification')
                .delete()
                .eq('id', id);
            if(error) throw error;
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