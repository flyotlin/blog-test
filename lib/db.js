var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Blog = new Schema({
    Username: String,
    Article: String,
    CreateDate: Date
});

var Message = new Schema({
    Visitor: String,
    Comment: String,
    ArticleID: String,
    /* MessageID後面的是甚麼型態? */
    // MessageID: Schema.Types.ObjectId,
    CreateDate: Date
});

var User = new Schema({
    Username: String,
    Password: String
});

mongoose.model('Blog', Blog);
mongoose.model('Message', Message);
mongoose.model('User', User);

mongoose.connect('mongodb://localhost/blog');