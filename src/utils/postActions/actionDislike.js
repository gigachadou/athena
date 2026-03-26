/**
 * Dislike qilish uchun async funksiya, try...catchda ishlatilsin
 * @param {string} postId - post IDsi
 * @param {number} userId - login qilingan user IDsi
 */
export default async function actionDislike(postId, userId) {
    //postdan like ni olib tashlash:

    const res = await fetch(`http://localhost:3000/posts/${postId}`);
    if (!res.ok) throw new Error("Error at actionDislike - GET1");
    const post = await res.json();

    const res2 = await fetch(`http://localhost:3000/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ likes: post.likes.filter(e => e !== userId) })
    });

    if (!res2.ok) throw new Error("Error at actionDislike - PATCH1");

};