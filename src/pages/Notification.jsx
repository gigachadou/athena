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
                setNotification(UserNotes.reverse())
            } catch (error) {
                setError(error.message)
            }
        }

        getNotes()
    }, [])

    async function handleMarkAllAsRead() {
        try {
            const id = JSON.parse(localStorage.getItem("loginConf")).user.id;

            const res = await fetch(`http://localhost:3000/notification?userID=${id}`);
            if (!res.ok) throw new Error("Failed to fetch notifications");

            const notes = await res.json();

            const unreadNotes = notes.filter(note => note.status !== "read");

            await Promise.all(
                unreadNotes.map(note =>
                    fetch(`http://localhost:3000/notification/${note.id}`, {
                        method: "PATCH",
                        headers: { "Content-type": "application/json" },
                        body: JSON.stringify({ status: "read" })
                    })
                )
            );

            setNotification(prev =>
                prev.map(note => ({ ...note, status: "read" }))
            );

        } catch (err) { }
    }

    async function handleDeleteAll() {
    try {
        const id = JSON.parse(localStorage.getItem("loginConf")).user.id;

        const res = await fetch(`http://localhost:3000/notification?userID=${id}`);
        if (!res.ok) throw new Error("Failed to fetch notifications");

        const notes = await res.json();

        await Promise.all(
            notes.map(note =>
                fetch(`http://localhost:3000/notification/${note.id}`, {
                    method: "DELETE"
                })
            )
        );
        
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
            <button onClick={handleMarkAllAsRead}>Mark as read</button>
            <button onClick={handleDeleteAll}>Delete ALl</button>
        </div>
        {
            notification.length === 0 ? <h2>No notifications yet</h2> : notification.map(note => <NoteCard key={note.noteID} header={note.header} text={note.text} time={note.creadetAt} noteID={note.noteID} status={note.status} id={note.id} />)
        }
    </div>
};

export default Notification;