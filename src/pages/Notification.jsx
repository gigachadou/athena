import { useEffect, useState } from "react";
import NoteCard from "../components/NoteCard";
import "../styles/Notification.css"
import { FaXmark } from "react-icons/fa6";

function Notification() {
    const [notification, setNotification] = useState([]);
    const [error, setError] = useState("")

    useEffect(() => {
        async function getNotes() {
            try {
                let id = JSON.parse(localStorage.getItem("loginConf")).user.id;

                const res = await fetch(`http://localhost:3000/notification`);
                if (!res.ok) throw new Error("Not loaded notes");

                let notes = await res.json();
                let UserNotes = notes.filter(note => note.userID === id) || [];
                setError('');
                setNotification(UserNotes)
            } catch (error) {
                setError(error.message)
            }
        }

        getNotes()
    }, [])

    if(error) return (
        <div className="notification-error">
            <FaXmark/>
            <h2>Server-side error</h2>
        </div>
    )

    return <div className="notification">
        <div className="State">
            <h2>Notifications:</h2>
            <button>Mark as read</button>
        </div>
        {
            notification.length === 0 ? <h2>No notifications yet</h2> : notification.map(note => <NoteCard key={note.noteID} header={note.header} text={note.text} time={note.creadetAt} noteID={note.noteID} status={note.status}/>)
        }
    </div>
};

export default Notification;