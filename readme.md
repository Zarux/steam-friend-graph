# steam-friend-graph

Displays your friends and your friends friends as nodes and the friendship as edges.
This is mye graph:
![Example](http://i.imgur.com/rls03Yn.png)
The red node is my steam-profile

## Info
* Due to limitations on my server, i set the limit of friends to 100.
* Some unicode names get skipped
* Run generate_graph2.py [id]
  * Takes a steam id, crawls the friendlist (maybe switch to steam API) and creates frienddata.
  * Using pygexf to create .gexf file
  * Runs a Java program that uses gephi-toolkit to rank nodes and change layout
  * Using a modified version of [This script](http://grep.law.harvard.edu/~hroberts/sigma/sigma.js-master/plugins/gexf2Json.py) reads the layouted .gexf and creates a .json file 
  * Not caching friendlists YET, should add that
* server.js/web
 * Not complete
 * Should check if file exists, if not create, else send the json object over socket.io
 * Will implement queue system
 * Should add a timeperiod for graphs to expire
* All in all
 * Bunch of libraries hacked together
 * Not efficient, need a good CPU
 
