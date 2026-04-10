import { supabase } from "../supabaseClient";

/**
 * Komment qo'shish uchun async funksiya, try...catchda ishlatilsin
 * @param {string} postId - post IDsi
 * @param {number} userId - login qilingan user IDsi
 * @param {string} text - komment teksti
 */
export default async function actionComment(postId, userId, text) {
    //postga commentni joylash:
    const commentId = userId + "-" + Date.now();
    
    const { data: post, error: getError } = await supabase
        .from('posts')
        .select('comments')
        .eq('id', postId)
        .single();

    if (getError) throw getError;

    const { error: updateError } = await supabase
        .from('posts')
        .update({ 
            comments: [...(post.comments || []), { id: commentId, user: userId, text: text, post: postId }] 
        })
        .eq('id', postId);

    if (updateError) throw updateError;
};