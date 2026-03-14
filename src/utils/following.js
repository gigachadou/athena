async function following(userID , followerID) {
    let res = await fetch(`http://localhost:3000/users/${userID}`);
    let data = await res.json();
    let followers = data.followers;

    for(let i = 0; i < followers.length; i++) {
        if(followers[i].followerID === followerID) {
            return false;
        }
        if(followers[i].followerID === userID) {
            return false;
        }
    }

    // Hali tegmay tur hali chala tugamagan

    // let updatedFollower = [...data.followers , {
    //     followerID: followerID,
    //     followerName: ""
    // }]
    // let getFollower = await fetch(`http://localhost:3000/users/${userID}/following`, {})
}