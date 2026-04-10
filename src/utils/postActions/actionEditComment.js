import { supabase } from "../supabaseClient";

/**
 * Komment edit qilish uchun async funksiya, try...catchda ishlatilsin
 * @param {string} postId - post IDsi
 * @param {string} commentId - comment Idsi
 * @param {string} newComment - yangi komment text
 */
export default async function actionEditComment(postId, commentId, newComment) {

    const { data: post, error: getError } = await supabase
        .from('posts')
        .select('comments')
        .eq('id', postId)
        .single();

    if (getError) throw getError;

    const { error: updateError } = await supabase
        .from('posts')
        .update({
            comments: (post.comments || []).map(c => {
                if (c.id === commentId) return { ...c, text: newComment };
                return c;
            })
        })
        .eq('id', postId);

    if (updateError) throw updateError;
};
