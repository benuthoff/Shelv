// Shelv
// by Ben Uthoff
// Web Code

// Socket Pointers
var socket = io();

var Shelv = new Vue({

	el: '#Shelv',

	data: {


		view: 'home',
		window: false,
		viewlist: [
			['home', 'fa fa-home'],
			['space', 'fa fa-th-large'],
			['list', 'fa fa-th-list']
		],

		database_name: false,
		database_type: false,

		database_list: [],

		main: [],
		groups: {},

		working_index: false,
		working_instance: false,

		typeset: {
			'instance': {
				title: 'String',
				author: 'String',
				isbn: 'Integer',

				cover: 'Image',
				series: 'Group:Series',
				volume: 'Integer',
				pages: 'Integer',

				added: 'Date',
				status: 'Select:Status',
				tags: 'List',
				notes: 'LongString'
			},
			selections: {
				'Status': ['Plan to Read', 'Reading', 'Complete', '']
			}
		}

	},

	watch: {
		database_name: (next, prev) => {
			socket.emit('data_overwrite_request', next);
		}
	},

	methods: {

		setView(id) {
			this.view = id;
		},
		setInstance(index) {
			if (this.working_index === index) { // If already open, Close.
				this.working_index = false;
				return;
			};
			this.working_index = index;
			this.working_instance = _(this.main[index]);
		},

		saveInstance() {
			this.main[this.working_index] = this.working_instance;
			socket.emit('save_data', {
				'main': this.main,
				'type': this.database_type,
				'groups': this.groups
			});
		},

		barcode() {
			this.window = 'qrcode';
			setTimeout(()=>{
				new QRCode(
				document.getElementById('qrcode'),
				'https://shelv.benuthoff.repl.co/barcode/');
			}, 10);
		}

	}

});

socket.on('configfile', (pack)=>{
	Shelv.database_name = pack.open_database; // Currently open database;
	Shelv.database_list = pack.database_list; // List of databases;
});
socket.on('data_overwrite', (db)=>{
	console.log('OVERWRITE.')
	Shelv.main = db.main;
	Shelv.database_type = db.type;
	Shelv.groups = db.groups;
});

function _(obj) { return {...obj} };