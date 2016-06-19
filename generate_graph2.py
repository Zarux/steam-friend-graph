# coding: utf-8
import requests
from bs4 import BeautifulSoup
import re, math
import unicodecsv as csv
import copy
import networkx as nx
from networkx.readwrite import json_graph
import json, random, sys
import unicodedata
import subprocess as sp
import gexf2json
import time

def strip_accents(s):
   return ''.join(c for c in unicodedata.normalize('NFD', s)
                  if unicodedata.category(c) != 'Mn')

userdata = {}
friends = []
user = ""
#G=nx.Graph()

def main(user):
	fname = "graphs/steam_"+user+".gexf.json"
	file=open(fname,"w+")
	file.write("{}")
	file.close()
	url = getFriendUrl(user)
	resp = requests.get(url)
	html = resp.text
	friend_list = getFriendList(user)
	if len(friend_list) == 0:
		print "Error 1"
		sys.exit(1)
	userdata[user]={"friends":friend_list,"name":"ME"}
	#print userdata[user]["friends"]
	count = 0 
	for i in userdata[user]["friends"]:
		count += 1
		#print count,
		#print "/",
		#print len(userdata[user]["friends"])	
		userdata[i[0]] = {"friends":[],"name":i[1]}
		userdata[i[0]]["friends"] = getFriendList(i[0])

	return userdata
		
def getFriendUrl(s_id):
	try:
		v = float(s_id)
		url = "http://steamcommunity.com/profiles/"+str(s_id)+"/friends/"
	except ValueError:
		url = "http://steamcommunity.com/id/"+s_id+"/friends/"
		
	return url

def getFriendList(s_id):
	
	url = getFriendUrl(s_id)
	try:
		resp = requests.get(url)
	except requests.exceptions.ContentDecodingError:
		return []
	friends = []
	html = resp.text
	soup = BeautifulSoup(html, 'html.parser')
	friendboxes = soup.find_all("div", class_="friendBlock")
	print "\r"+url,
	sys.stdout.flush()
	count = 0
	for i in friendboxes:
		url = i.find_all("a",class_="friendBlockLinkOverlay")[0]["href"]
		try:
			steam_id = re.sub(r'(http://steamcommunity.com/(profiles|id)/(.*)|)',r'\3',url)
		except sre_constants.error:
			continue
		namebox = i.find_all("div",class_="friendBlockContent")[0]
		namebox.span.decompose()
		try:
			name = strip_accents(unicode(namebox.get_text().strip().encode('utf-8','ignore')))
		except UnicodeDecodeError:
			continue
		friends.append((steam_id.lower(),name))
		count += 1
		if count == 100:
			return friends

	return friends

def additionalFriends(userdata):
	userdata_tmp = copy.deepcopy(userdata)
	for s_id in userdata:
		for i in userdata[s_id]["friends"]:
			if i[0] in userdata:
				continue
			userdata_tmp[i[0]] = {"friends":[],"name":i[1]}
			userdata_tmp[i[0]]["friends"] = getFriendList(i[0])

	return userdata_tmp

def toGefx(userdata,user):
	import gexf
	gexf_file=gexf.Gexf("jo","outfile")
	graph=gexf_file.addGraph("undirected","static","graph")

	nodes = []
	edges = []
	for i in userdata:
		s_id = i.lower()
		s_name = userdata[i]["name"]
		if s_id not in nodes and s_id != user:
			nodes.append(s_id)
			graph.addNode(s_id,s_name)
		for j in userdata[i]["friends"]:
			target_name = j[1]
			target_id = j[0].lower()
			if target_id not in nodes:
				nodes.append(target_id)
				graph.addNode(target_id,target_name)
			ed_id = str(s_id)+str(target_id)

			if ed_id not in edges:
				edges.append(ed_id)
				edges.append(str(target_id)+str(s_id))
				graph.addEdge(ed_id,s_id,target_id)
			print '\r Nodes: {} Edges: {} '.format(len(nodes),len(edges)),
			sys.stdout.flush()

	fname = "graphs/steam_"+user+".gexf"
	file=open(fname,"w+")
	gexf_file.write(file)
	return fname

def layoutJava(fname):
	print fname
	p = sp.Popen("java -jar gephi-layout/layout.jar "+fname, stdout=sp.PIPE, shell = True)
	out, err = p.communicate()
	print out
	print err

def convertToJson(fname):
	gexf2json.convert(fname,fname+".json")

if __name__ == '__main__':
	now = time.time()
	user = sys.argv[1].lower()
	users = main(user)
	#makeNodes(users,user)
	fname = toGefx(users,user)
	#fname = "graphs/steam_"+user+".gexf"
	layoutJava(fname)
	layoutJava(fname)
	layoutJava(fname)
	convertToJson(fname)
	print time.time()-now

	#users = additionalFriends(users)
	