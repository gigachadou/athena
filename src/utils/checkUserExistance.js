/**
 * User haqiqatdan ham database'da bormi yo'qmi tekshirish uchun async funksiya
 * @returns {Promise<Error>}
 */
export default async function checkUserExistance(token) {
    console.log("Function is working");
    // const token = localStorage.getItem("access_token");

    if (!token) throw new Error("Token is missing for checkUserExistance");

    const res = await fetch("http://localhost:5000/users/me", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!res.ok) throw new Error("Invalid access token")
};