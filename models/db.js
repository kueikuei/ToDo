const mongoose = require('mongoose');

//local mongo
// mongoose.connect('mongodb://localhost/todoapp');

//remote mongo(mLab)
var dbURI = "mongodb://kueikuei:81233@ds145868.mlab.com:45868/todo";
mongoose.connect(dbURI);

//Mongoose Data Schema    
const TodoSchema = { 
  title: String,
  date: { type: Date, default: Date.now() },
};

//Transfer Schema to Model
// Compile Schema
module.exports = mongoose.model('Todo', TodoSchema);

//會轉成複數todos
