import { supabase } from "./supabaseClient";

/**
 * Follow qiluvchi async funksiya, try...catchda ishlatilsin! 
 * @param {*} userID - user idsi
 * @param {*} followerID - follower idsi
 * @param {Function} changeFollowState - setter Function
 */
async function following(userID, followerID, changeFollowState) {
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

    if ((user.followings || []).includes(followerID)) {
        return;
    }

    const newFollowings = [...(user.followings || []), followerID];
    const newFollowers = [...(follower.followers || []), userID];

    const { error: patchUserError } = await supabase
        .from('users')
        .update({ followings: newFollowings })
        .eq('id', userID);

    const { error: patchFollowerError } = await supabase
        .from('users')
        .update({ followers: newFollowers })
        .eq('id', followerID);

    if (patchUserError || patchFollowerError) throw new Error("Error updating follow data");

    changeFollowState(true);
};

export default following;