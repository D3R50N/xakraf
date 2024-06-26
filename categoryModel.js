class Category {
  constructor({ id = "", title = "", path = "", count = 0 }) {
    this.id = id;
    this.title = title;
    this.path = path;
    this.count = count;
  }
}

module.exports = Category;