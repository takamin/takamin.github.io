var connect = require('connect');
var serveStatic = require('serve-static');
const opn = require('opn');
var app = connect();
app.use(serveStatic(__dirname));
app.listen(5000);
opn('http://localhost:5000/index.html');
