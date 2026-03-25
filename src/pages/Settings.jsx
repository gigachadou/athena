import { useNavigate } from "react-router-dom"
import "../styles/settings.css"
import EditModal from "../components/EditModal";
import { useEffect, useState } from "react";

function Settings() {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false)
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState('');
    useEffect(() => {
        async function getUser() {
            try {
                let id = JSON.parse(localStorage.getItem("loginConf")).user.id;
                if (!id) throw new Error('User not logging yet')
                let res = await fetch(`http://localhost:3000/users/${id}`);
                if (!res.ok) throw new Error('Server error, please reload the page, or try again later');
                let data = await res.json();
                setUserData(data);
                setError('');
            } catch (error) {
                setError(error.message);
            }
        }
        getUser()
    }, [])

    function logOutHandler(e) {
        e.preventDefault();
        localStorage.clear();
        location.reload();
    };
    async function cleanFollows(userId) {
        let users = await fetch(`http://localhost:3000/users`)
            .then(res => res.json());

        for (let user of users) {
            let updatedFollowers = user.followers.filter(f => f !== userId);
            let updatedFollowings = user.followings.filter(f => f !== userId);

            if (
                updatedFollowers.length !== user.followers.length ||
                updatedFollowings.length !== user.followings.length
            ) {
                await fetch(`http://localhost:3000/users/${user.id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        followers: updatedFollowers,
                        followings: updatedFollowings
                    })
                });
            }
        }
    }
    async function handleDeleteProfile(e) {
        e.preventDefault();

        let id = JSON.parse(localStorage.getItem("loginConf")).user.id;

        try {
            let posts = await fetch(`http://localhost:3000/posts?userId=${id}`)
                .then(res => res.json());

            for (let post of posts) {
                await fetch(`http://localhost:3000/posts/${post.id}`, {
                    method: "DELETE"
                });
            }
            let allPosts = await fetch(`http://localhost:3000/posts`)
                .then(res => res.json());

            for (let post of allPosts) {
                let updatedComments = post.comments.filter(c => c.user !== id);
                let updatedLikes = post.likes.filter(l => l !== id);

                await fetch(`http://localhost:3000/posts/${post.id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        comments: updatedComments,
                        likes: updatedLikes
                    })
                });
            }

            await cleanFollows(id);

            let notes = await fetch(`http://localhost:3000/notification`)
                .then(res => res.json());

            for (let note of notes) {
                if (note.userID === id) {
                    await fetch(`http://localhost:3000/notification/${note.id}`, {
                        method: "DELETE"
                    });
                }
            }

            await fetch(`http://localhost:3000/users/${id}`, {
                method: "DELETE"
            });

            localStorage.clear();
            location.reload();

        } catch (err) {
            console.log(err);
        }
    }

    return <div className="settings">
        <button onClick={() => { setIsOpen(true) }}>Edit informations</button>
        {isOpen && <EditModal closeModal={setIsOpen} UserId={userData.id} data={setUserData} />}
        <button onClick={() => { navigate("/aboutapplicationinformation") }}>About the developers</button>
        <button onClick={handleDeleteProfile}>Delete the account</button>
        <button onClick={logOutHandler}>Log out</button>
        <button onClick={() => navigate('/profile')}>Back</button>
    </div>
};

export default Settings;