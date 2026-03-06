import { useState } from "react"
import "../styles/editModal.css"

function EditModal({ closeModal, UserId, data }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [bio, setBio] = useState("");
    const [error, setError] = useState("")

    async function handleSubmit() {
        const updatedData = {};

        if (name) updatedData.name = name;
        if (bio) updatedData.bio = bio;
        if (Object.keys(updatedData).length > 0 && !error) {
            try {
                const response = await fetch(
                    `http://localhost:3000/users/${UserId}`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(updatedData)
                    }
                );

                if (!response.ok) {
                    throw new Error(`Server error: ${response.status}`);
                };

                const result = await response.json();
                localStorage.setItem("loginConf", JSON.stringify({ user: result }));
                data(result);
                closeModal(false);
            } catch (err) {
                setError(`Error: ${err.message}`);
            };
        };
    };

    function handleIgnore() {
        setBio("");
        setEmail("");
        setName("");
        closeModal(false);
    };

    return <dialog open className="dialog">
        <h2>Edit user's info</h2>
        <input type="text" placeholder="New name" onChange={(e) => setName(e.target.value)} />
        <input type="text" placeholder="New bio" onChange={(e) => setBio(e.target.value)} />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <div className="modal__btns">
            <button onClick={handleSubmit}>Change</button>
            <button onClick={handleIgnore}>Cancel</button>
        </div>
    </dialog>
}

export default EditModal;