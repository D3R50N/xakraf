#!/usr/bin/env node

const Movie = require("./movieModel");
const categoriesJson = require("./categories.json");
const Category = require("./categoryModel");
const clipboard = require("copy-paste");
const searchTerms = process.argv.slice(2);
const categories = categoriesJson.map((category) => {
  return new Category(category);
});

const movies = [];

function has(val, term) {
  return val.toLowerCase().includes(term.toLowerCase());
}
function printMovie(movie = new Movie()) {
  console.log("-------------------------");
  const printObj = {
    "TITLE :": movie.title,
    "CATEGORY :": movie.category,
    "DESCRIPTION :": movie.description,
    "FILE :": movie.file.trim() === "" ? "🚫 NO FILE FOUND" : movie.file,
  };
  for (let key in printObj) {
    console.log(key, printObj[key]);
  }
  console.log("-------------------------");

  if (movie.file.trim() === "") {
    return false;
  }
  return true;
}
Movie.prototype.includes = function (searchTerm) {
  for (let key in this) {
    if (key === "includes") continue;
    if (has(this[key], searchTerm)) {
      return true;
    }
  }
  return false;
};

const find = (searchTerms) => {
  return movies.filter((movie) => {
    for (let term of searchTerms) {
      if (!movie.includes(term)) {
        return false;
      }
    }
    return true;
  });
};

categories.forEach((category) => {
  const categoryMovies = require(`./db/${category.path}`);
  movies.push(...categoryMovies.map((movie) => new Movie(movie)));
});

console.log("Search terms: ", searchTerms.join(", "));
const foundMovies = find(searchTerms);
console.log(
  "Found",
  foundMovies.length,
  "on",
  movies.length,
  "movies" + (foundMovies.length > 0 ? ":" : ".")
);

if (foundMovies.length == 1) {
  const movie = foundMovies[0];
  if (!printMovie(movie)) return;

  clipboard.copy(movie.file);
  console.log("\nCopied file URL to clipboard ✅\n");
} else if (foundMovies.length > 1) {
  foundMovies.forEach((movie, index) => {
    console.log("-------------------------");
    console.log(index + 1);
    printMovie(movie);
  });
}
