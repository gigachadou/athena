import AddButton from "../components/AddButton"

function Add() {
    return <div className="add">
        <div className="addheader">
            <h2>Ulashmoqchi bo'lganlaringizni bo'lishing</h2>
            <p>Istalgan odamlar uchun bo'lishing</p>
        </div>
        <div className="selectFile">
            <AddButton/>
        </div>
    </div>
}

export default Add