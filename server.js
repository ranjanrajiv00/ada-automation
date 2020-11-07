var express = require('express');
var app = express();
var port = process.env.PORT || 3030;

app.use(express.static('reports'));

app.listen(port, function(){
    console.log('Server started at ' + port);
});