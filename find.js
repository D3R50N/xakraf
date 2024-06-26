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
      if (movie.includes(term)) {
        return true;
      }
    }
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
console.log(
  foundMovies
    .map((movie) => "- " + movie.id + "\t" + movie.title + " | " + movie.file)
    .join("\n")
);
if (foundMovies.length == 1) {
    clipboard.copy(foundMovies[0].file);
    console.log("\nCopied '",foundMovies[0].title,"' file to clipboard");
}