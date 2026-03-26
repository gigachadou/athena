/**
 * Follow qiluvchi async funksiya, try...catchda ishlatilsin! 
 * @param {*} userID - user idsi
 * @param {*} followerID - follower idsi
 * @param {Function} changeFollowState - setter Function
 */
async function following(userID, followerID, changeFollowState) {
    let response = await fetch(`http://localhost:3000/users/${userID}`);
    let resFollower = await fetch(`http://localhost:3000/users/${followerID}`);

    let user = await response.json();
    let follower = await resFollower.json();

    if (user.followings.includes(followerID)) {
        return;
    }

    const newFollowings = [...user.followings, followerID];
    const newFollowers = [...follower.followers, userID];

    await fetch(`http://localhost:3000/users/${userID}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            followings: newFollowings
        })
    });

    await fetch(`http://localhost:3000/users/${followerID}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            followers: newFollowers
        })
    });

    changeFollowState(true);
};

export default following;