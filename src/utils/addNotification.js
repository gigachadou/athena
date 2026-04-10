import { supabase } from "./supabaseClient";

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
        noteid: Math.floor(Math.random() * 100000000),
        userid: userID,
        creadetat: new Date().toISOString()
    }

    const { error } = await supabase
        .from('notification')
        .insert([note]);

    if (error) throw error;
};

export default addNote;