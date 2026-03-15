async function unfollow(userID, followerID, changeFollowState) {
    try {
        let response = await fetch(`http://localhost:3000/users/${userID}`);
        let resFollower = await fetch(`http://localhost:3000/users/${followerID}`);

        let user = await response.json();
        let follower = await resFollower.json();

        if (!user.followings.includes(followerID)) {
            return;
        }

        const newFollowings = user.followings.filter(id => id !== followerID);
        const newFollowers = follower.followers.filter(id => id !== userID);

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

        changeFollowState(false);

    } catch (error) {
        console.error("Unfollow error:", error);
    }
}

export default unfollow;