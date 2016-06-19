var connect = require('connect');
var fs = require('fs');
var serveStatic = require('serve-static'); 
var app = connect(); 

app.use(serveStatic('../public')); 
app.listen(5000);

var server = require('http').Server(app);
var io = require('socket.io').listen(server);
server.listen(8000);
console.log("Server running on port: ",8000)
io.sockets.on('connection', function (socket) {

	var clientIp = socket.request.connection.remoteAddress
	console.log("Connected: " + clientIp);

	socket.on('generate', function (data) {
		var id = data.id;
		var data = JSON.parse(fs.readFileSync('../graphs/steam_'+id+'.gexf.json', 'utf8'));
		socket.emit("retData",data);
	});
});