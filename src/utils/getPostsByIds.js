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
        }
        const posts = await res.json();

        const mediaIds = [...new Set(
            posts
                .map(post => post.media)
                .filter(mediaId => mediaId !== null && mediaId !== undefined)
        )];

        let mediaById = new Map();
        if (mediaIds.length) {
            const mediaParams = new URLSearchParams();
            mediaIds.forEach(id => mediaParams.append("id", id));

            const mediaRes = await fetch(`http://localhost:3000/media?${mediaParams.toString()}`);
            if (!mediaRes.ok) {
                throw new Error(`Media fetch failed: ${mediaRes.status}`);
            }

            const media = await mediaRes.json();
            mediaById = new Map(media.map(item => [item.id, item.media]));
        }

        const postsById = new Map(
            posts.map(post => [
                post.id,
                {
                    ...post,
                    media: mediaById.get(post.media) ?? [],
                },
            ])
        );

        return postIds.map(id => postsById.get(id)).filter(Boolean);
    } catch (err) {
        console.warn("Posts fetch error:", err);
        return [];
    }
}
