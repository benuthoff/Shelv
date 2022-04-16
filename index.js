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
	index: -1,
	main: [],
	groups: {
		'Series': {},
		'Formats': {}
	}
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

// Get list of files that dont start with __ and do end in `.json`.
let files = fs.readdirSync(root).filter(
	path => ( !(path.startsWith('__')) && (path.endsWith('.json')) )
);
// If there are valid files present.
if (files.length > 0) {
	// Add them to the database list.
	files.forEach((file)=>{
		__config.database_list.push( file.substring(0,file.length-5) );
	});
	console.log('All DBs: ', __config.database_list);
	// If the current database isnt present, open the first one.
	if (!files.includes(__config.open_database+'.json')) {
		__config.open_database = files[0].substring(0,files[0].length-5);
	};
// If there are no valid files- create new!
} else {
	__config.open_database = 'MANGA001';
	fs.writeFileSync(root+'/MANGA001.json', JSON.stringify(__newfile));
	console.log('Created Database at [MANGA001]');
};

// Save all changes to `__config.json`.
saveconfig();


// Socket.io Endpoints
io.on('connection', (socket) => {

	// Send the app the config at startup.
	socket.emit('configfile', __config);

	// When the app requests database, send...
	socket.on('data_request', (name)=>{
		__config.open_database = name;
		saveconfig();
		let data = JSON.parse(fs.readFileSync(root+'/' + name + '.json'));
		socket.emit('database_load', data);
	});

	// Saves database changes to file system.
	socket.on('save_data', (pack)=>{
		fs.writeFileSync(root+'/' + __config.open_database + '.json', JSON.stringify(pack));
	});

	// Creates a new database `name`.json, and opens it.
	socket.on('new_database', (name)=>{
		fs.writeFileSync(root+'/' + name + '.json', JSON.stringify(__newfile));
		__config.open_database = name;
		saveconfig();
		socket.emit('configfile', __config);
	});

});

// Run Web Server.
app.use(express.static('src'));
server.listen(9091, () => {
	console.log('listening on *:9091');
});