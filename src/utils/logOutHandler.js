import { logoutUser } from "./authService";

/**
 * Clears the session and reloads the page
 * @param {Event} e - Event, important!
 */
export default function logOutHandler(e) {
    if (e && e.preventDefault) e.preventDefault();
    logoutUser();
};