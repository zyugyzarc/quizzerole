from flask import Flask, abort, send_from_directory

app = Flask(__name__)

playerpositions = {}

@app.route('/')
def apphtml():
	return send_from_directory('.', 'app.html')

@app.route('/favicon.ico')
def imageico():
	return send_from_directory('.', 'icon.png')

@app.route('/favicon.png')
def image():
	return send_from_directory('.', 'icon.png')

@app.route('/app.js')
def appjs():
	return send_from_directory('.', 'app.js')

@app.route('/component.js')
def componentjs():
	return send_from_directory('.', 'component.js')

@app.route('/questions.json')
def questions():
	return send_from_directory('.', 'questions.json')

@app.route('/player/<string:playername>')
def playerdata(playername):
	global playerpositions

	if playername in playerpositions:	
		return str(playerpositions[playername])
	
	abort(404, description='bingbong')

@app.route('/play/<string:playername>/<int:position>')
def playerset(playername, position):
	global playerpositions

	playerpositions[playername] = position

	return "ok"

if __name__ == '__main__':
	app.run('0.0.0.0', 8888)