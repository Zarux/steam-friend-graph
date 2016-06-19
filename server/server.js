var connect = require('connect');
var fs = require('fs');
var serveStatic = require('serve-static'); 
var app = connect(); 
var exec = require('child_process').exec
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
		var id = data.id.toLowerCase();
		if(!isFile('../graphs/steam_'+id+'.gexf.json')){
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
				var data = JSON.parse(fs.readFileSync('../graphs/steam_'+id+'.gexf.json', 'utf8'));
				var retData={"id":id,"data":data}
				socket.emit("retData",retData);
			});

		}else{
			var data = JSON.parse(fs.readFileSync('../graphs/steam_'+id+'.gexf.json', 'utf8'));
			var retData={"id":id,"data":data}
			socket.emit("retData",retData);
		}
		
	});
});


function isFile(filename) {
	try{
		var stats = fs.statSync(filename);
		return 1
	}catch(e){
		return 0;
	}
}