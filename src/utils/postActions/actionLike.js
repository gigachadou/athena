import { supabase } from "../supabaseClient";

/**
 * Like qilish uchun async funksiya, try...catchda ishlatilsin
 * @param {string} postId - post IDsi
 * @param {number} userId - login qilingan user IDsi
 */
export default async function actionLike(postId, userId) {
    //postga likeni joylash:

    const { data: post, error: getError } = await supabase
        .from('posts')
        .select('likes')
        .eq('id', postId)
        .single();

    if (getError) throw getError;

    const { error: updateError } = await supabase
        .from('posts')
        .update({ likes: [...(post.likes || []), userId] })
        .eq('id', postId);

    if (updateError) throw updateError;
};