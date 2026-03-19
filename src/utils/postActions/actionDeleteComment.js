/**
 * Komment o'chirish uchun async funksiya, try...catchda ishlatilsin
 * @param {string} postId - post IDsi
 * @param {number} userId - login qilingan user IDsi
 * @param {string} commentId - comment Idsi
 */
export default async function actionDeleteComment(postId, userId, commentId) {
    //postdan commentni olib tashlash:

    const res = await fetch(`http://localhost:3000/posts/${postId}`);
    if (!res.ok) throw new Error("Error at actionComment - GET1");
    const post = await res.json();

    const res2 = await fetch(`http://localhost:3000/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ comments: post.comments.filter(c => c.id !== commentId) })
    });

    if (!res2.ok) throw new Error("Error at actionComment - PATCH1");

    //userdan commentni olib tashlash ------------------------------------------>>>

    const res3 = await fetch(`http://localhost:3000/users/${userId}`);
    if (!res3.ok) throw new Error("Error at actionComment - GET2");
    const user = await res3.json();

    const res4 = await fetch(`http://localhost:3000/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ comments: user.comments.filter(c => c.id !== commentId) })
    });
    if (!res4.ok) throw new Error("Error at actionComment - PATCH2");
};