/**
 * Postni o'chirib tashlash uchun asinxron funksiya, try...catchda ishlatilsin
 * @param {string} postId - o'chiriladigan post idsi 
 * @param {number} userId - owner idsi
 */
export async function deletePost(postId, userId) {
    const res = await fetch(`http://localhost:3000/users/${userId}`);
    if (!res.ok) throw new Error("Server error: Couldn't delete the post, 1");
    const data = await res.json();

    const res2 = await fetch(`http://localhost:3000/users/${userId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            posts: data.posts.filter(e => e !== postId),
        })
    });
    if (!res2.ok) throw new Error("Server error: Couldn't delete the post, 2");
    const res3 = await fetch(`http://localhost:3000/posts/${postId}`, {
        method: "DELETE"
    });
    if (!res3.ok) throw new Error("Server error: Couldn't delete the post, 3");
};