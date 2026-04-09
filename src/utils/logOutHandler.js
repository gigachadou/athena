import { supabase } from "./supabaseClient";

/**
 * Clears the session and reloads the page
 * @param {Event} e - Event, important!
 */
export default async function logOutHandler(e) {
    if (e && e.preventDefault) e.preventDefault();
    await supabase.auth.signOut();
    location.reload();
};