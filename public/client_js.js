
var socket = io.connect(window.location.hostname+":8000");
var current_graph;

sigma.classes.graph.addMethod('neighbors', function(nodeId) {
	var k;
	var neighbors = {}
	var index = this.allNeighborsIndex[nodeId] || {};

	for (k in index)
		neighbors[k] = this.nodesIndex[k];

	return neighbors;
});

socket.on("retData",function(retData){
	//console.log(data);
	console.log("answer")
	if(current_graph){
		clear_graph(current_graph)
	}
	createGraph(retData.data,retData.id);	
});


if(location.href.indexOf("?id=") > -1){
	var id = location.href.replace(/.*?\?id=([\w]*).*/,"$1");
	$("#id_input").val(id);
	socket.emit('generate',{
		'id':id
	});
}

function createGraph(data,id){
	var s = new sigma({ 
		graph: data,
		container: 'container',
		settings: {
			defaultLabelColor: 'rgb(10,255,10)'
		}
	});
	current_graph = s;
	s.graph.nodes().forEach(function(n) {
		if(n.id == id){
			n.color = "rgb(255,0,0)"
		}
		n.originalColor = n.color;
	});
	s.graph.edges().forEach(function(e) {
		e.originalColor = e.color;
	});

	s.bind('clickNode', function(e) {
		var nodeId = e.data.node.id,
		toKeep = s.graph.neighbors(nodeId);
		toKeep[nodeId] = e.data.node;

		s.graph.nodes().forEach(function(n) {
			if (toKeep[n.id])
				n.color = n.originalColor;
			else
				n.color = '#272727';
		});

		s.graph.edges().forEach(function(e) {
			if (toKeep[e.source] && toKeep[e.target])
				e.color = e.originalColor;
			else
				e.color = '#272727';
		});

		s.refresh();
	});

	s.bind('clickStage', function(e) {
		s.graph.nodes().forEach(function(n) {
			n.color = n.originalColor;
		});

		s.graph.edges().forEach(function(e) {
			e.color = e.originalColor;
		});
			s.refresh();
	});
}

function clear_graph(s) {
	$("#container")
    //this gets rid of all the ndoes and edges
    s.graph.clear();
    //this gets rid of any methods you've attached to s.
    s.graph.kill();
};

function search(){
	var canvas = $('#container').children().each(function(){
		this.remove();
	}); // or document.getElementById('canvas');
	
	var id = $("#id_input").val();
	if(id.length <= 0){
		alert("not valid");
		return;
	}
	var url = location.href;
	var newurl = url.replace(/(.*?)\?id=[\w]*(.*)/,"$1$2")
	history.pushState("", id+" graph", newurl+"?id="+id);
	socket.emit('generate',{
		'id':id
	});
}