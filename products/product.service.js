const db = require('../_helpers/db');

module.exports = {
    getAllProductsByUser,
    registerProduct,
    deleteProduct,
    searchProduct,
};

async function getAllProductsByUser(email) {
    return await db.getAllProductsByUser(email);
}

async function registerProduct(body) {
    if (body.email == null || body.email === '') {
        throw Error("Non a valid email");
    }
    return await db.registerProduct(
        body.email,
        body.title,
        body.description,
        body.price,
        body.imageUrl
    );
}

async function deleteProduct(id) {
    return await db.deleteProduct(id);
}

async function searchProduct(query) {
    return await db.getProductsMatch(query);
}
