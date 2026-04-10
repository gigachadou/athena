import { supabase } from "../supabaseClient";

/**
 * Postni o'chirib tashlash uchun asinxron funksiya, try...catchda ishlatilsin
 * @param {string} postId - o'chiriladigan post idsi 
 * @param {number} userId - owner idsi
 */
export async function deletePost(postId, userId) {
    const { data: user, error: userFetchError } = await supabase
        .from('users')
        .select('posts')
        .eq('id', userId)
        .single();

    if (userFetchError) throw userFetchError;

    const { error: userUpdateError } = await supabase
        .from('users')
        .update({ posts: (user.posts || []).filter(e => e !== postId) })
        .eq('id', userId);

    if (userUpdateError) throw userUpdateError;

    const { error: postDeleteError } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

    if (postDeleteError) throw postDeleteError;
};