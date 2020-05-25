const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const errorHandler = require('./_helpers/error-handler');
const app = express();

// Support URL-encoded bodies
app.use(bodyParser.urlencoded({
    extended: false
}));
// Support JSON-encoded bodies
app.use(bodyParser.json());
app.use(cors());

app.use('/users', require('./users/user.controller'));
app.use('/products', require('./products/product.controller'));
app.use('/chat', require('./chat/chat.controller'));
// Error handler
app.use(errorHandler);

app.listen(8080, function () {
    console.log('App listening on port 8080!');
});

process.on('SIGINT', function() {
    console.log( "\nGracefully shutting down from SIGINT (Ctrl-C)" );
    process.exit(1);
});