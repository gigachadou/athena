import { useEffect, useState } from "react";
import NoteCard from "../components/NoteCard";
import "../styles/Notification.css"
import { FaXmark } from "react-icons/fa6";
import { useOutletContext } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

function Notification() {
    const [notification, setNotification] = useState([]);
    const [error, setError] = useState("")
    const { userData } = useOutletContext();
 
    useEffect(() => {
        async function getNotes() {
            try {
                if (!userData?.id) return;
                
                const { data: notes, error: notesError } = await supabase
                    .from('notification')
                    .select('*')
                    .eq('userid', userData.id)
                    .order('creadetat', { ascending: false });

                if (notesError) throw notesError;

                setError('');
                setNotification(notes || [])
            } catch (error) {
                setError(error.message)
            }
        }

        getNotes()
    }, [userData]);

    async function handleMarkAllAsRead() {
        try {
            const { error: patchError } = await supabase
                .from('notification')
                .update({ status: 'read' })
                .eq('userid', userData.id)
                .neq('status', 'read');

            if (patchError) throw patchError;

            setNotification(prev =>
                prev.map(note => ({ ...note, status: "read" }))
            );
        } catch (err) { }
    }

    async function handleDeleteAll() {
        try {
            const { error: deleteError } = await supabase
                .from('notification')
                .delete()
                .eq('userid', userData.id);

            if (deleteError) throw deleteError;
            
            setNotification([]);
        } catch (err) {
            console.log(err.message);
        }
    }

    if (error) return (
        <div className="notification-error">
            <FaXmark />
            <h2>Server-side error</h2>
        </div>
    )

    return <div className="notification">
        <div className="State">
            <h2>Notifications:</h2>
            <button onClick={handleMarkAllAsRead} disabled={notification.length === 0}>Mark as read</button>
            <button onClick={handleDeleteAll} disabled={notification.length === 0}>Delete all</button>
        </div>
        {
            notification.length === 0 ? <h2>No notifications yet</h2> : notification.map(note => <NoteCard key={note.noteid} header={note.header} text={note.text} time={note.creadetat} noteID={note.noteid} status={note.status} id={note.id} />)
        }
    </div>
};

export default Notification;