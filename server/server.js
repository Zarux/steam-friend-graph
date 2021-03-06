var fs = require('fs');
var serveStatic = require('serve-static'); 
var express = require('express');
var path = require("path");
var app = express();
var exec = require('child_process').exec
app.use(express.static(path.join(__dirname,"../public")));
var createNewGraph = {};
var isGenerating = {};

var server = require('http').Server(app);
var io = require('socket.io').listen(server);
server.listen(8000);
console.log("Server running on port: ",8000);

app.engine('html', require('ejs').renderFile);
app.set('views', path.join(__dirname,'../public'));
app.set('view engine', 'html');
app.get("/", function (req, res) {
	res.render("main.html",{id:""});
});
app.get("/:id", function (req, res) {
	res.render("main.html",{id:escapeHtml(req.params.id)});
});
app.get("/:id/new", function (req, res) {
	res.render("main.html",{id:escapeHtml(req.params.id)});
	createNewGraph[req.params.id]=true;
});

io.sockets.on('connection', function (socket) {
	var clientIp = socket.request.connection.remoteAddress;
	console.log("Connected",clientIp);
	socket.on('generate', function (data) {
		var id = escapeHtml(data.id.toLowerCase());
		generate(socket,id);
	});
});

function generate(socket, id){
	if(!isFile('../graphs/steam_'+id+'.gexf.json') || createNewGraph[id]){
		createNewGraph[id] = false;
		if(isGenerating[id])
			return
		isGenerating[id] = true;
		socket.emit("addQueue",id);
		console.log("START WITH GENERATING FOR ",id);
		exec("cd .. && python generate_graph2.py "+id,function(error,stdout,stderr){
			if (error) {
				console.error(`exec error: ${error}`);
				return;
			}
			console.log(`stdout: ${stdout}`);
			console.log(`stderr: ${stderr}`);
			console.log("DONE WITH GENERATING FOR ",id);
			isGenerating[id] = false;
			var data = JSON.parse(fs.readFileSync('../graphs/steam_'+id+'.gexf.json', 'utf8'));
			var retData={"id":id,"data":data}
			socket.emit("retData",retData);
		});

	}else{
		if(!isGenerating[id]){
			var data = JSON.parse(fs.readFileSync('../graphs/steam_'+id+'.gexf.json', 'utf8'));
			var retData={"id":id,"data":data}
			socket.emit("retData",retData);
		}
	}
}
function escapeHtml(text) {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

function isFile(filename) {
	try{
		var stats = fs.statSync(filename);
		return 1
	}catch(e){
		return 0;
	}
}