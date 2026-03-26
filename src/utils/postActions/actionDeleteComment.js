/**
 * Komment o'chirish uchun async funksiya, try...catchda ishlatilsin
 * @param {string} postId - post IDsi
 * @param {string} commentId - comment Idsi
 */
export default async function actionDeleteComment(postId, commentId) {
    //postdan commentni olib tashlash:

    const res = await fetch(`http://localhost:3000/posts/${postId}`);
    if (!res.ok) throw new Error("Error at actionDeleteComment - GET1");
    const post = await res.json();

    const res2 = await fetch(`http://localhost:3000/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ comments: post.comments.filter(c => c.id !== commentId) })
    });

    if (!res2.ok) throw new Error("Error at actionDeleteComment - PATCH1");

};