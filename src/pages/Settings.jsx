import { useNavigate } from "react-router-dom"
import "../styles/settings.css"
import EditModal from "../components/EditModal";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { getCurrentUser, clearSession } from "../utils/authService";

function Settings() {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false)
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState('');
    useEffect(() => {
        async function getUser() {
            try {
                const user = await getCurrentUser();
                if (!user) throw new Error('User not logging yet');
                setUserData(user);
                setError('');
            } catch (error) {
                setError(error.message);
            }
        }
        getUser()
    }, []);

    async function handleDeleteProfile(e) {
        e.preventDefault();
        try {
            const userId = userData.id;

            // 1. Clean up comments and likes from all other posts (since they are in JSONB/ARRAY and can't be easily cascaded)
            const { data: allPosts } = await supabase.from('posts').select('*');
            
            for (let post of allPosts || []) {
                let updatedComments = (post.comments || []).filter(c => c.user !== userId);
                let updatedLikes = (post.likes || []).filter(l => l !== userId);

                if (updatedComments.length !== (post.comments || []).length || updatedLikes.length !== (post.likes || []).length) {
                    await supabase
                        .from('posts')
                        .update({ comments: updatedComments, likes: updatedLikes })
                        .eq('id', post.id);
                }
            }

            // 2. Clean up followers and followings from all other users
            const { data: allUsers } = await supabase.from('users').select('*');
            for (let user of allUsers || []) {
                let updatedFollowers = (user.followers || []).filter(f => f !== userId);
                let updatedFollowings = (user.followings || []).filter(f => f !== userId);

                if (updatedFollowers.length !== (user.followers || []).length || updatedFollowings.length !== (user.followings || []).length) {
                    await supabase
                        .from('users')
                        .update({ followers: updatedFollowers, followings: updatedFollowings })
                        .eq('id', user.id);
                }
            }

            // 3. Delete the user
            await supabase.from('users').delete().eq('id', userId);
            
            // 4. Clear local session and reload
            clearSession();
            location.reload();

        } catch (err) {

        }
    }

    function handleLogout() {
        clearSession();
        navigate("/login");
    }

    return <div className="settings">
        <button onClick={() => { setIsOpen(true) }}>Edit informations</button>
        {isOpen && <EditModal closeModal={setIsOpen} UserId={userData.id} data={setUserData} />}
        <button onClick={() => { navigate("/aboutapplicationinformation") }}>About the developers</button>
        <button onClick={handleDeleteProfile}>Delete the account</button>
        <button onClick={handleLogout}>Log out</button>
        <button onClick={() => navigate('/profile')}>Back</button>
    </div>
};

export default Settings;