const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ArticleSchema = new mongoose.Schema({
	title: String,
	author: String,
	url: String,
	scraped: {
		type: Boolean,
		default: true,
	}
});

const Article = mongoose.model('Article', ArticleSchema);

module.exports = Article;