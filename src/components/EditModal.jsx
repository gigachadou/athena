import { useState } from "react";
import "../styles/editModal.css";

function EditModal({ closeModal, UserId, data }) {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [error, setError] = useState("");

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  async function handleSubmit() {
    if (!name.trim() && !bio.trim() && !avatar) {
      setError("At least one field must be filled");
      return;
    }

    try {
      const updateData = {};
      if (name.trim()) updateData.name = name;
      if (bio.trim()) updateData.bio = bio;

      if (avatar) {
        const base64Avatar = await convertToBase64(avatar);
        updateData.avatar = base64Avatar;
      }

      const response = await fetch(`http://localhost:3000/users/${UserId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const result = await response.json();

      localStorage.setItem("loginConf", JSON.stringify({ user: result }));
      data(result);
      closeModal(false);
    } catch (err) {
      setError(`Error: ${err.message}`);
    }
  }

  function handleIgnore() {
    setBio("");
    setName("");
    closeModal(false);
  }

  return (
    <dialog open className="dialog">
      <h2>Edit user's info</h2>
      <input
        type="text"
        placeholder="New name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="text"
        placeholder="New bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setAvatar(e.target.files[0])}
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div className="modal__btns">
        <button onClick={handleSubmit}>Change</button>
        <button onClick={handleIgnore}>Cancel</button>
      </div>
    </dialog>
  );
}

export default EditModal;