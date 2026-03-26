/**
 * Komment edit qilish uchun async funksiya, try...catchda ishlatilsin
 * @param {string} postId - post IDsi
 * @param {string} commentId - comment Idsi
 * @param {string} newComment - yangi komment text
 */
export default async function actionEditComment(postId, commentId, newComment) {

    const res = await fetch(`http://localhost:3000/posts/${postId}`);
    if (!res.ok) throw new Error("Error at actionEditComment - GET1");
    const post = await res.json();

    const res2 = await fetch(`http://localhost:3000/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({
            comments: post.comments.map(c => {
                if (c.id === commentId) return { ...c, text: newComment };
                return c;
            })
        })
    });

    if (!res2.ok) throw new Error("Error at actionEditComment - PATCH1");
};
