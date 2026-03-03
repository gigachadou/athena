import { useEffect, useState } from "react"
import "../styles/editModal.css"

function EditModal({ closeModal, UserId , data}) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [bio, setBio] = useState("");
    const [error, setError] = useState("")
    async function handleSubmit() {
        if (!name && !email && !bio) {
            setError("Hech bo'lmaganda bitta qatorni to'ldiring");
            return;
        }

        const updatedData = {};

        if (name) updatedData.name = name;
        if (email) updatedData.email = email;
        if (bio) updatedData.bio = bio;

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

            const result = await response.json();
            localStorage.setItem("loginConf" , JSON.stringify({user:result}))
            data(result)
            closeModal(false);
        } catch (error) {
            setError(`Xatolik: ${error}`);
        }
    }
    function handleIgnore(){
        setBio("")
        setEmail("")
        setName("")
        closeModal(false)
    }
    return <dialog open className="dialog">
        <h2>Foydalanuvchi ma'lumotlarini tahrirlash</h2>
        <input type="text" placeholder="Login..." onChange={(e) => setName(e.target.value)} />
        <input type="text" placeholder="bio..." onChange={(e) => setBio(e.target.value)} />
        <input type="email" placeholder="emailni o'zgartirish" onChange={(e) => setEmail(e.target.value)} />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button onClick={handleSubmit}>Qo'shish</button>
        <button onClick={handleIgnore}>Bekor qilish</button>
    </dialog>
}

export default EditModal