/**
 * Clears the local storage and reloads the page
 * @param {Event} e - Event, important!
 */
export default function logOutHandler(e) {
    e.preventDefault();
    localStorage.clear();
    location.reload();
};