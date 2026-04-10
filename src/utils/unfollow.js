import { supabase } from "./supabaseClient";

/**
 * Unfollow qilish uchun funksiya, try...catchda ishlatilsin
 * @param {number} userID 
 * @param {number} followerID 
 * @param {Function} changeFollowState 
 */
async function unfollow(userID, followerID, changeFollowState) {
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('followings')
        .eq('id', userID)
        .single();
        
    const { data: follower, error: followerError } = await supabase
        .from('users')
        .select('followers')
        .eq('id', followerID)
        .single();

    if (userError || followerError) throw new Error("Error fetching user data");

    if (!(user.followings || []).includes(followerID)) {
        return;
    }

    const newFollowings = (user.followings || []).filter(id => id !== followerID);
    const newFollowers = (follower.followers || []).filter(id => id !== userID);

    const { error: patchUserError } = await supabase
        .from('users')
        .update({ followings: newFollowings })
        .eq('id', userID);

    const { error: patchFollowerError } = await supabase
        .from('users')
        .update({ followers: newFollowers })
        .eq('id', followerID);

    if (patchUserError || patchFollowerError) throw new Error("Error updating follow data");

    changeFollowState(false);
}

export default unfollow;