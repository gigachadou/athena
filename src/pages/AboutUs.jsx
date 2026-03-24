import { FaArrowAltCircleLeft } from "react-icons/fa"
import "../styles/aboutus.css"
import { useNavigate } from "react-router-dom"

function AboutUs(){
    const navigate = useNavigate();

    return <div className="about-container">
        <FaArrowAltCircleLeft  onClick={()=>navigate("/settings")} className="about-back-btn"/>
        <div className="about__header">
            <h2>About Developers</h2>
        </div>
        <div className="about__body">
            <p>
                Athena is a small team-built space for students and researchers who want
                to present ideas, run group projects, and share study updates with peers.
                We chose React, Vite, and Supabase so the app stays fast while still offering
                real-time notes, follower feeds, and simple post creation. This project is a
                learning journey that keeps accessibility, collaboration, and documentation
                in focus so every new feature helps others build better together.
            </p>
        </div>
    </div>
}

export default AboutUs
