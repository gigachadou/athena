import { supabase } from "../supabaseClient";

/**
 * Komment o'chirish uchun async funksiya, try...catchda ishlatilsin
 * @param {string} postId - post IDsi
 * @param {string} commentId - comment Idsi
 */
export default async function actionDeleteComment(postId, commentId) {
    //postdan commentni olib tashlash:

    const { data: post, error: getError } = await supabase
        .from('posts')
        .select('comments')
        .eq('id', postId)
        .single();

    if (getError) throw getError;

    const { error: updateError } = await supabase
        .from('posts')
        .update({ comments: (post.comments || []).filter(c => c.id !== commentId) })
        .eq('id', postId);

    if (updateError) throw updateError;
};