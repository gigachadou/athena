async function addNote(header, text, userID) {
    try {
        let note = {
            header: header,
            text: text,
            status:"Active",
            noteID: (Math.random()*100000000000000000000000000),
            userID: userID,
            creadetAt: new Date().toISOString()
        }
        const response = await fetch(`http://localhost:3000/notefication`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(note),
        })

        if (!response.ok) throw new Error("Not Added notefication")
    } catch (error) {
    }
}

export default addNote