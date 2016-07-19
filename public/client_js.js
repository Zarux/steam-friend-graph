$(document).ready(function(){
	$('#inputBox').keypress(function(e){
		if(e.keyCode==13)
			$('#search_submit').click();
	});
	checkStart()
});
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
	$("#loading_text").hide();
	console.log("answer",Object.keys(retData.data).length)
	if(Object.keys(retData.data).length != 0){
		if(current_graph){
			clear_graph(current_graph)
		}
		
		createGraph(retData.data,retData.id);
	}	
});

function checkStart(){
	if($("#id_input").val()!=""){
		socket.emit('generate',{
			'id':$("#id_input").val()
		});
		$("#loading_text").show();
	}
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
	s.bind('doubleClickNode', function(e) {
		console.log(e.data.node.id);
		location.href=window.location.origin+"/"+e.data.node.id;
	})

	s.bind('clickNode', function(e) {
		var nodeId = e.data.node.id,
		toKeep = s.graph.neighbors(nodeId);
		toKeep[nodeId] = e.data.node;

		s.graph.nodes().forEach(function(n) {
			if(n.id == id){
				n.color = "rgb(0,255,0)"
			}
			else if (toKeep[n.id])
				n.color = n.originalColor;
			else
				n.color = '#272727';
		});

		s.graph.edges().forEach(function(e2) {
			if (e.data.node.id == e2.source || e.data.node.id == e2.target) {
				e2.color = 'rgb(200,200,10)';
			}
			else if (toKeep[e2.source] && toKeep[e2.target]){
				e2.color = "rgb(200,10,10)";
			}
			else{
				e2.color = '#272727';
			}
			

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
	$('#container').children().each(function(){
		this.remove();
	});
	s.graph.clear();
    	s.graph.kill();
};

function search(){
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
function getQueryParam(param) {
	var result =  window.location.search.match(
		new RegExp("(\\?|&)" + param + "(\\[\\])?=([^&]*)")
	);

	return result ? result[3] : false;
}
