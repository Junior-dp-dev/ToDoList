const { urlencoded } = require("express");
const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
const port = 3000;

app.set("view engine", "ejs"); //Usar EJS com Express
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const workItems = [];

main().catch((err) => console.log(err));
async function main() {
  mongoose.set("strictQuery", false);
  //await mongoose.connect("mongodb://127.0.0.1:27017/toDoListDB");
  await mongoose.connect("mongodb+srv://admin-junior:jRlUZ58aYursvpDE@cluster0.mmqjria.mongodb.net/toDoListDB");
}

const itemSchema = new mongoose.Schema({
  name: String,
});
const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({ name: "Welcome to your toDolist!" });
const item2 = new Item({ name: "Hit the + button to add new item." });
const item3 = new Item({ name: "<-- Hit this to delete an item." });
const defautItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema],
});
const List = mongoose.model("List", listSchema);

app.get("/", (req, res) => {
  Item.find({}, (err, foundItems) => {
    if (foundItems.length === 0) {
      Item.insertMany(defautItems, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Sucesssss");
        }
      });
      res.redirect("/");
    }

    res.render("index", { listTittle: "Today", newItemList: foundItems });
  });
});

app.post("/", (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({ name: itemName });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, (err, result) => {
      console.log(result.items);
      result.items.push(item);
      result.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", (req, res) => {
  const checkItemId = req.body.checkbox;
  const listName = req.body.listName;
  console.log(listName);

  if (listName === "Today") {
    Item.findByIdAndDelete(checkItemId, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Sucesssss");
      }
      res.redirect("/");
    });
  } else {
    List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkItemId } } }, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/" + listName);
      }
    });
  }
});

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }, async (err, result) => {
    if (err) {
      console.log(err);
    } else {
      if (!result) {
        const list = new List({
          name: customListName,
          items: defautItems,
        });

        await list.save();

        res.redirect("/" + customListName);
      } else {
        res.render("index", { listTittle: result.name, newItemList: result.items });
      }
    }
  });
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.post("/work", (req, res) => {
  const item = req.body.newItem;
  items.push(item);
  res.redirect("/work");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});
