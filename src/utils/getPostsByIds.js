export default async function getPostsByIds(postIds) {
    if (!postIds?.length) return [];

    try {
        const responses = await Promise.all(
            postIds.map(id =>
                fetch(`http://localhost:3000/posts/${id}`)
                    .then(res => {
                        if (!res.ok) {
                            if (res.status === 404) return null;
                            throw new Error(`Post ${id} fetch failed: ${res.status}`);
                        }
                        return res.json();
                    })
                    .catch(err => {
                        console.warn(`Post ${id} error:`, err);
                        return null;
                    })
            )
        );

        const posts = responses.filter(post => post !== null);
        return posts;
    } catch (err) {
        return [];
    };
};