/**
 * Serverga fayl qo'shish uchun. Siroj kodingni EditModal.jsx dan ko'chirib qo'ydim!
 * @param {File} file 
 * @returns {Promise}
 */

export function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};