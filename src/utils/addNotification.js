/**
 * Async funksiya, notifikatsya yuborish uchun. Try... catchni funksiya ishlatilinadigan joyda ishlatiladi!
 * @param {string} header - header
 * @param {string} text - text
 * @param {number} userID - userID
 */
async function addNote(header, text, userID) {
    let note = {
        header: header,
        text: text,
        status: "Active",
        noteID: (Math.random() * 100000000),
        userID: userID,
        creadetAt: new Date().toISOString()
    }
    const response = await fetch(`http://localhost:3000/notification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(note),
    })

    if (!response.ok) throw new Error("Couldn't add the notification");
};

export default addNote;