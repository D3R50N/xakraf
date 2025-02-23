
const categoriesJson = require("./categories.json");
const Category = require("./categoryModel");
const categories = categoriesJson.map((category) => {
    return new Category(category);
});

const path = require('path');
const fs = require('fs');

categories.forEach((category) => {
    const categoryMovies = require(`./db/${category.path}`);
    const moviesSet = [];
    for (let movie of categoryMovies) {
        if (moviesSet.filter(m => m.id == movie.id).length > 0) continue;
        moviesSet.push(movie);
    }
    fs.writeFileSync(path.join("db", category.path), JSON.stringify(moviesSet));


});

