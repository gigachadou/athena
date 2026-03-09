export default async function checkUserExistance() {
    console.log("Function is working");
    const token = localStorage.getItem("access_token");

    if (!token) {
        return false;
    };

    try {
        const res = await fetch("http://localhost:5000/users/me", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (res.ok) {
            const user = await res.json();
            return true;
        } else if (res.status === 401 || res.status === 403) {
            return false;
        }
    } catch (err) {
        console.error(err);
        return false;
    };
};