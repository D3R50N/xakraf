const { default: axios } = require("axios");
const { JSDOM } = require("jsdom");
const fs = require("fs");
const Movie = require("./movieModel");
const categoriesJson = require("./categories.json");
const Category = require("./categoryModel");
const path = require("path");

const categories = categoriesJson.map((category) => {
  return new Category(category);
});

const baseUrl = "https://xakraf.com";

function appLog(...message) {
  console.clear();
  console.log(...message);
}

async function getDom(url) {
  var response = await axios.get(url);
  var html = response.data;
  var document = new JSDOM(html, {}).window.document;

  return document;
}

async function scrapMoviesOnCategory(category = new Category()) {
  const pagesCount = category.count;
  const listPath = "/rmznt0k9a/c/xakraf/" + category.id + "/";
  var movies = [];

  var pageUrl = (page = 0) => baseUrl + listPath + `${page}`;

  async function getMovies(page = 0) {
    var document = await getDom(pageUrl(page));
    var links = document.querySelectorAll("#hann > p > span > a");

    links.forEach((link) => {
      var title = link.textContent.replaceAll("\n", "").trim();
      var url = link.getAttribute("href");
      var id = "mov_" + url.split("/")[url.split("/").length - 1];
      movies.push(
        new Movie({
          id,
          title,
          url,
          categoryId: category.id,
          category: category.title,
        })
      );
    });

    // appLog("Page " + (page + 1) + " : " + links.length + " movies");

    return movies;
  }
  function saveMovies() {
    fs.writeFileSync(path.join("db", category.path), JSON.stringify(movies));
    appLog(
      `[${category.title}] ` + "Category",
      category.title,
      "movies saved to",
      path.join("db", category.path)
    );
  }

  async function getAllMovies() {
    return new Promise((resolve, reject) => {
      var pagesScrapped = 0;
      for (let i = 0; i < pagesCount; i++) {
        getMovies(i).then((movies) => {
          appLog(
            `[${category.title}] Getting movies list`,
            "Page",
            i + 1,
            "of",
            pagesCount
          );
          pagesScrapped++;
          if (pagesScrapped == pagesCount) {
            resolve();
          }
        });
      }
    });
  }

  async function getInfos(movie = new Movie()) {
    try {
      var document = await getDom(baseUrl + movie.url);
      var img = document.querySelector(
        "body > div.content > div.row > div.column1 > p:nth-child(5) > img"
      );
      var desc = document.querySelector(
        "body > div.content > div.row > div.column1 > p:nth-child(7)"
      );
      var iframe = document.querySelector(
        "body > div.content > div.row > div.column1 > p:nth-child(9) > iframe"
      );
      if (img) {
        movie.image = img.getAttribute("src");
      }
      if (desc) {
        movie.description = desc.textContent.replaceAll("\n", "").trim();
      }
      if (iframe) {
        movie.iframeSrc = iframe.getAttribute("src");
      }
    } catch (error) {
      //   console.log("Error getting image for " + movie.title, ":", error.message);
    }
  }

  async function getAllInfos() {
    return new Promise((resolve, reject) => {
      var moviesScrapped = 0;
      movies.forEach((movie) => {
        getInfos(movie).then(() => {
          appLog(
            `[${category.title}] Got infos of`,
            moviesScrapped,
            "on",
            movies.length,
            "movies"
          );
          moviesScrapped++;
          if (moviesScrapped == movies.length) {
            resolve();
          }
        });
      });
    });
  }

  async function getFile(movie = new Movie()) {
    try {
      var document = await getDom(movie.iframeSrc);
      var scripts = document.querySelectorAll("script");
      var script;
      scripts.forEach((s) => {
        if (s.textContent.includes("jwplayer")) {
          script = s;
        }
      });

      var file = script.textContent
        .split("file:")[1]
        .split(",")[0]
        .split('"')[1];

      movie.file = file;
    } catch (err) {
      //   console.log("Error getting file for " + movie.title, ":", err.message);
    }
  }

  async function getAllFiles() {
    return new Promise((resolve, reject) => {
      var moviesScrapped = 0;
      movies.forEach((movie) => {
        getFile(movie).then(() => {
          moviesScrapped++;
          appLog(
            `[${category.title}] Got files of`,
            moviesScrapped,
            "on",
            movies.length,
            "movies"
          );
          if (moviesScrapped == movies.length) {
            resolve();
          }
        });
      });
    });
  }

  async function scrap() {
    appLog(`[${category.title}] Getting movies list`);
    await getAllMovies();

    appLog(`[${category.title}] Getting infos for`, movies.length, "movies");
    await getAllInfos();

    appLog(`[${category.title}] Getting files for`, movies.length, "movies");
    await getAllFiles();

    saveMovies();
  }

  await scrap();
}

async function main() {
  for (let category of categories) {
    await scrapMoviesOnCategory(category);
  }
}

main();
