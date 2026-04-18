import { getSession } from "./authService";

/**
 * User haqiqatdan ham session'da bormi yo'qmi tekshirish uchun async funksiya
 * @returns {Promise<Error>}
 */
export default async function checkUserExistance() {
    const session = getSession();
    if (!session) throw new Error("Invalid session or user not found");
};