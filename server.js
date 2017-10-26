// Dependencies

var express = require("express");
var exphbs = require("express-handlebars");
var mongoose = require("mongoose");

var logger = require("morgan");
// Request and cheerio make the scraping possible
var request = require("request");
var cheerio = require("cheerio");
var bodyParser = require("body-parser");

var Article = require('./models/article.js');

// Initialize Express
var app = express();

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
// Make public a static dir
app.use(express.static("public"));

// Set Handlebars as the default templating engine.
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

var databaseUrl = "scrapedNews";
var collections = ["articles"];
// Database configuration with mongoose
mongoose.connect("mongodb://localhost/scrapedNews");
var db = mongoose.connection;
// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

// Show any mongoose errors
db.on("error", function (error) {
	console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function () {
	console.log("Mongoose connection successful.");
});


//Main Route
app.get("/", function(req, res){
	res.redirect("/home")
})
//homepage
app.get("/home", function(req, res){
	res.render("index")
})

// Retrieve data from the db
app.get("/all", function(req, res) {
  // Find all results from the scrapedData collection in the db
  Article.find({}, function(error, found) {
    // Throw any errors to the console
    if (error) {
      console.log(error);
    }
    // If there are no errors, send the data to the browser as json
    else {
      res.json(found);
    }
  });
});

// Scrape data from one site and place it into the mongodb db
app.get("/scrape", function(req, res) {
  // Make a request for the news section of ycombinator
  request("http://uproxx.com/entertainment/", function(error, response, html) {
    // Load the html body from request into cheerio
    var $ = cheerio.load(html);
    // For each element with a "title" class
    $("div.story").each(function(i, element) {
      // Save the text and href of each link enclosed in the current element
		var url = $(element).find('div').find("a").attr("href");
		var title = $(element).find('div').find("a").find("img").attr("alt");
		var author = $(element).children('.author').find("span").find("a").text();

		var result = {
			title: title,
			url: url,
			author: author
		}

		if (title && author && url) {
                // Insert the data in the articles db
                var scrapedArticle = new Article(result);
                scrapedArticle.save(function (error, doc) {
                    if (error) {
                        console.log("error", error);
                    } else {
                        console.log("new article scraped:", doc);
                    }
                })
            }
    });
  });
 });

app.listen(3000, function () {
	console.log("App running on port 3000!");
});
