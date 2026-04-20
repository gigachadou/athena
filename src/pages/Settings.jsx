import { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useOutletContext, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaSignOutAlt, FaUserShield, FaBell, FaCoins, FaWallet, FaArrowUp } from "react-icons/fa";
import { logoutUser } from "../utils/authService";
import addNote from "../utils/addNotification";
import "../styles/settings.css";

export default function Settings() {
    const { userData, setUserData } = useOutletContext();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const buyPackages = [
        { id: 1, amount: 100, price: 0.99 },
        { id: 2, amount: 500, price: 3.99 },
        { id: 3, amount: 1200, price: 9.99 },
        { id: 4, amount: 3000, price: 19.99 },
    ];

    const handleBuyCoins = async (pkg) => {
        setLoading(true);
        try {
            const newBalance = (userData.coins || 0) + pkg.amount;
            const { error: updateError } = await supabase.from('users').update({ coins: newBalance }).eq('id', userData.id);
            if (updateError) throw updateError;

            await supabase.from('transactions').insert([{
                user_id: userData.id,
                type: 'buy',
                amount: pkg.amount,
                status: 'completed'
            }]);

            setUserData(prev => ({ ...prev, coins: newBalance }));
            addNote("Purchase Successful!", `You received ${pkg.amount} A-Coins! 🪙`, userData.id);
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    const handleWithdraw = async () => {
        if (!userData.coins || userData.coins < 1000) {
            setError("Minimum withdrawal amount is 1000 A-Coins ($1).");
            setTimeout(() => setError(""), 5000);
            return;
        }
        setLoading(true);
        try {
            const amount = 1000;
            const newBalance = userData.coins - amount;
            const { error: updateError } = await supabase.from('users').update({ coins: newBalance }).eq('id', userData.id);
            if (updateError) throw updateError;

            await supabase.from('transactions').insert([{
                user_id: userData.id,
                type: 'withdraw',
                amount: amount,
                status: 'pending'
            }]);

            setUserData(prev => ({ ...prev, coins: newBalance }));
            addNote("Withdrawal Requested", "Your request is being processed. 💸", userData.id);
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    return (
        <div className="settings-page">
            <div className="settings-header">
                <button onClick={() => navigate(-1)} className="back-btn"><FaArrowLeft /></button>
                <h2>Settings</h2>
            </div>

            <div className="settings-section wallet-section">
                <div className="section-title">
                    <FaWallet /> <h3>Athena Coin Wallet</h3>
                </div>
                <div className="wallet-card">
                    <div className="balance-info">
                        <span className="label">Available Balance</span>
                        <div className="amount">
                            <FaCoins /> <span>{userData?.coins || 0} A-Coins</span>
                        </div>
                    </div>
                    <button className="withdraw-btn" onClick={handleWithdraw} disabled={loading}>
                        <FaArrowUp /> Withdraw
                    </button>
                </div>

                <h4 className="sub-title">Buy A-Coins</h4>
                <div className="packages-grid">
                    {buyPackages.map(pkg => (
                        <div key={pkg.id} className="package-card" onClick={() => handleBuyCoins(pkg)}>
                            <div className="pkg-amount">{pkg.amount}</div>
                            <div className="pkg-coin">A-Coins</div>
                            <div className="pkg-price">${pkg.price}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="settings-section">
                <div className="section-title">
                    <FaUserShield /> <h3>Account Security</h3>
                </div>
                <button className="settings-item">Change Password</button>
                <button className="settings-item">Two-Factor Authentication</button>
            </div>

            <div className="settings-section">
                <div className="section-title">
                    <FaBell /> <h3>Notifications</h3>
                </div>
                <div className="settings-toggle">
                    <span>Push Notifications</span>
                    <input type="checkbox" defaultChecked />
                </div>
            </div>

            <button className="logout-btn" onClick={logoutUser}>
                <FaSignOutAlt /> Logout
            </button>
            
            {error && <div className="settings-error">{error}</div>}
        </div>
    );
}