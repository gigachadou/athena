/**
 * Dislike qilish uchun async funksiya, try...catchda ishlatilsin
 * @param {string} postId - post IDsi
 * @param {number} userId - login qilingan user IDsi
 */
export default async function actionDislike(postId, userId) {
    //postga likeni joylash:

    const res = await fetch(`http://localhost:3000/posts/${postId}`);
    if (!res.ok) throw new Error("Error at actionDislike - GET1");
    const post = await res.json();

    const res2 = await fetch(`http://localhost:3000/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ likes: post.likes.filter(e => e !== userId) })
    });

    if (!res2.ok) throw new Error("Error at actionDislike - PATCH1");

    //userga dislikeni joylash ------------------------------------------>>>

    const res3 = await fetch(`http://localhost:3000/users/${userId}`);
    if (!res3.ok) throw new Error("Error at actionDislike - GET2");
    const user = await res3.json();

    const res4 = await fetch(`http://localhost:3000/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ likes: user.likes.filter(e => e !== postId) })
    });
    if (!res4.ok) throw new Error("Error at actionDislike - PATCH2");
};