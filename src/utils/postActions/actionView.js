/**
 * Ko'rishlar sonini ko'paytiruvchi async funksiya, postni ustiga bosgan payti ishlatiladi. try...catchda ishlatilsin
 * @param {string} id 
 */

export async function actionView(id) {
    // qiymatlar olinishi
    const res = await fetch(`http://localhost:3000/posts/${id}`);
    if (!res.ok) throw new Error("Error at actionView - GET");
    const post = await res.json();

    const res2 = await fetch(`http://localhost:3000/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ views: post.views + 1 })
    });
    if (!res2.ok) throw new Error("Error at actionView - PATCH");
};