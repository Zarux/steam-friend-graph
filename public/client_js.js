
var socket = io.connect(window.location.hostname+":8000");
socket.emit('generate',{
	'id':"Zaruxx"
});

sigma.classes.graph.addMethod('neighbors', function(nodeId) {
	var k;
	var neighbors = {}
	var index = this.allNeighborsIndex[nodeId] || {};

	for (k in index)
		neighbors[k] = this.nodesIndex[k];

	return neighbors;
});

socket.on("retData",function(data){
	console.log(data);
	createGraph(data);
})

function createGraph(data){
	var s = new sigma({ 
		graph: data,
		container: 'container',
		settings: {
			defaultLabelColor: 'rgb(10,255,10)'
		}
	});
	s.graph.nodes().forEach(function(n) {
		console.log(n)
		if(n.id == ekstraName){
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

function search(){

}