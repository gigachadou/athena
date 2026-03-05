import { FaPlus } from "react-icons/fa"
import "../styles/Addbutton.css"

function AddButton() {
    return <div className="Inputdiv">
        <div className="selector__divs">
            <label htmlFor="selector1">O'zingizga yoqgan narsani tanlang</label>
            <input type="file" id="selector1" />
        </div>
        <div className="selector__divs">
             <label htmlFor="selector2">O'zingizga yoqgan narsani yozishingiz mumkin</label>
             <input type="text" id="selector2" />
        </div>
        <button className="added-btn">Qo'shish</button>
    </div>
}

export default AddButton