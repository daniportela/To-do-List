//Requires
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js")
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

//App use
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

//Mongoose

mongoose.connect("mongodb+srv://admin-SAMPLE_USERNAME:SAMPLE_PASSWORD@todolistdb.nfjjz.mongodb.net/todolistDB", { useNewUrlParser: true }, { useUnifiedTopology: true }, { useFindAndModify: false });

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
  name: "Welcome to your todo list"
});

const item2 = new Item ({
  name: "Hit the + button to add a new item"
});

const item3 = new Item ({
  name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

//App get
app.get("/", function(req, res){
  const day = date.getDate();

  Item.find({}, function(err, foundItems){

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err){
        if (err) {
          console.log(err);
        } else {
          console.log("Success!");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", listDay: day, newListItems: foundItems});
    }
  });
});

app.get("/about", function(req, res){
  res.render("about");
});

app.get("/:dynamicList", function(req, res){
  const customListName = _.capitalize(req.params.dynamicList);
  const day = date.getDate();

  List.findOne({name: customListName}, function(err, foundList){
    if (!err) {
      if (!foundList) {
        const list = new List ({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + customListName)
      } else {
        res.render("list", {listTitle: foundList.name, listDay: day, newListItems: foundList.items})
      }
    }
  });
});

//App post
app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res){
  const deletedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(deletedItemId, function(err){
      if (!err) {
        console.log("Successfully deleted checked item!");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: deletedItemId}}}, function(err, foundList){
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }
});

//App listen

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function(){
  console.log("Server up and running!");
});
