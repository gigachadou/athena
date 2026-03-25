/**
 * 
 * @param {Array} postIds - post id laridan tuzilgan array
 * @returns {Array}
 */
export default async function getPostsByIds(postIds) {
    if (!postIds?.length) return [];

    try {
        const params = new URLSearchParams();
        postIds.forEach(id => params.append("id", id));

        const res = await fetch(`http://localhost:3000/posts?${params.toString()}`);
        if (!res.ok) {
            throw new Error(`Posts fetch failed: ${res.status}`);
        };
        const posts = await res.json();

        const postsById = new Map(posts.map(post => [post.id, {...post}]));

        return postIds.map(id => postsById.get(id)).filter(Boolean);
    } catch (err) {
        console.warn("Posts fetch error:", err);
        return [];
    }
}
