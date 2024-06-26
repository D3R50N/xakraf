class Movie {
  constructor({
    id = "",
    title = "",
    url = "",
    image = "",
    description = "",
    iframeSrc = "",
    file = "",
    category = "",
    categoryId = "",
  }) {
    this.title = title;
    this.id = id;
    this.url = url;
    this.image = image;
    this.description = description;
    this.iframeSrc = iframeSrc;
    this.file = file;
    this.category = category;
    this.categoryId = categoryId;
  }
}

module.exports = Movie;