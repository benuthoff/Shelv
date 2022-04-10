// Shelv
// by Ben Uthoff
// Server Code

// Dependencies and Setup.
const express = require('express');
const app = express();
const server = require('http').createServer(app);

const Socket = require('socket.io');
const io = new Socket.Server(server);

const os = require('os');
const fs = require('fs');
const root = './data';


// Default client data...
var __config = {
	open_database: 'MANGA001',
	database_list: []
};
var __newfile = {
	type: 'manga',
	main: [],
	groups: {}
};

// Function declarations...
function saveconfig() {
fs.writeFileSync(root+'/__config.json',
JSON.stringify(__config));};



// Inital setup...
console.log('Loading databases...');
if (!fs.existsSync(root)){  fs.mkdirSync(root) }; // File Directory
if (!fs.existsSync(root+'/__config.json')) { saveconfig() }; // Config File

// Read and update saved data...
__config = JSON.parse(fs.readFileSync(root+'/__config.json'));
__config.database_list = [];
fs.readdirSync(root).forEach((file)=>{
	if (file.startsWith('__')) { return };
	if (file.endsWith('.json')) {
		__config.database_list.push( file.substring(0,file.length-5) );
	};
});
console.log('All DBs: ', __config.database_list);



// Socket.io Endpoints
io.on('connection', (socket) => {

	socket.emit('configfile', __config);

	socket.on('data_overwrite_request', (name)=>{
		__config.open_database = name;
		saveconfig();
		let data = JSON.parse(fs.readFileSync(root+'/' + name + '.json'));
		socket.emit('database_load', data);
	});

	socket.on('save_data', (pack)=>{
		fs.writeFileSync(root+'/' + __config.open_database + '.json', JSON.stringify(pack));
	});

});

// Run Web Server.
app.use(express.static('src'));
server.listen(9091, () => {
	console.log('listening on *:9091');
});