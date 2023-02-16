const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
app.set('view engine', 'ejs'); // to pass data to front. check document
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static("public"));

mongoose.set('strictQuery', false);
mongoose.connect("mongodb://localhost:27017/todoListDB");

const itemSchema = {
    name: String
};

const Item = mongoose.model("Item",itemSchema);
const item1 = new Item ({
    name: "task1"
});
const item2 = new Item ({
    name: "task2"
});
const item3 = new Item ({
    name: "task3"
});
const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemSchema]
};
const List = mongoose.model("List", listSchema);
app.get("/", function( req, res){
    Item.find({},function(err, foundItems){
        if(foundItems.length === 0){
            Item.insertMany(defaultItems,function(err){
                if(err){
                    console.log(err);
                }else{
                    console.log("saved to DB successfuly");
                }
            });
            res.redirect("/");
        }else{
            res.render("list", {
                listTitle : "Today",
                newListItems : foundItems
            });
        }
        
    });
    
});
app.post("/", function( req, res){
    const itemName = req.body.newItem;
    const item = new Item({
        name: itemName
    });
    item.save();
    res.redirect("/");
    
});
app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox

    Item.findByIdAndRemove(checkedItemId, function(err){
        if(!err){
            console.log("successfully deleted checked item.");
        }
    })
    res.redirect("/");
});

app.get("/:customListName", function(req, res){

    const customListName = req.params.customListName;
    List.findOne({name: customListName}, function(err, foundList){
        if(!err){
            if(!foundList){
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/"+ customListName);
            }else{
                res.render(
                    "list",
                    {
                        listTitle: customListName,
                        newListItems: foundList.items
                    }
                );
            }
        }
    });
    
});
app.get("/about" , function( req, res){
    res.render("about");
});
app.listen(3000, function(){
    console.log("Server started on http://localhost:3000");
});