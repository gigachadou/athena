import { supabase } from "../supabaseClient";

/**
 * Ko'rishlar sonini ko'paytiruvchi async funksiya, postni ustiga bosgan payti ishlatiladi. try...catchda ishlatilsin
 * @param {string} id 
 */

export async function actionView(id) {
    // qiymatlar olinishi
    const { data: post, error: getError } = await supabase
        .from('posts')
        .select('views')
        .eq('id', id)
        .single();

    if (getError) throw getError;

    const { error: updateError } = await supabase
        .from('posts')
        .update({ views: (post.views || 0) + 1 })
        .eq('id', id);

    if (updateError) throw updateError;
};