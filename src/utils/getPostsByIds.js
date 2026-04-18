import { supabase } from "./supabaseClient";

/**
 * 
 * @param {Array} postIds - post id laridan tuzilgan array
 * @returns {Array}
 */
export default async function getPostsByIds(postIds) {
    if (!postIds?.length) return [];

    try {
        const { data: posts, error } = await supabase
            .from('posts')
            .select('*')
            .in('id', postIds);

        if (error) throw error;

        // Maintain the order of postIds provided in the argument
        const postsById = new Map(posts.map(post => [post.id, post]));
        return postIds.map(id => postsById.get(id)).filter(Boolean);
        
    } catch (err) {

        return [];
    }
}
