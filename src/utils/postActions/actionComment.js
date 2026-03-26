/**
 * Komment qo'shish uchun async funksiya, try...catchda ishlatilsin
 * @param {string} postId - post IDsi
 * @param {number} userId - login qilingan user IDsi
 * @param {string} text - komment teksti
 */
export default async function actionComment(postId, userId, text) {
    //postga commentni joylash:
    const commentId = userId + "-" + Date.now();
    const res = await fetch(`http://localhost:3000/posts/${postId}`);
    if (!res.ok) throw new Error("Error at actionComment - GET1");
    const post = await res.json();

    const res2 = await fetch(`http://localhost:3000/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ comments: [...post.comments, { id: commentId, user: userId, text: text, post: postId }] })
    });

    if (!res2.ok) throw new Error("Error at actionComment - PATCH1");

};