import { supabase } from "./supabaseClient";

/**
 * User haqiqatdan ham database'da bormi yo'qmi tekshirish uchun async funksiya
 * @returns {Promise<Error>}
 */
export default async function checkUserExistance() {
    console.log("Function is working");
    
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) throw new Error("Invalid session or user not found");
};