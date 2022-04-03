// `shelv`
// by Ben Uthoff
// Client-side Code

// Socket Pointers
var socket = io();

var Shelv = new Vue({

	el: '#Shelv',

	data: {


		view: 'home',
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

				added: 'Date',
				status: 'Select:Status',
				tags: 'List',
				notes: 'LongString'
			},
			selections: {
				'Status': ['Plan to Read', 'Reading', 'Complete']
			},
			editmap: [
				{ name: 'Title', view: 'heading', value: 'title', placeholder: 'Volume title...' },
				{ name: 'Author', view: 'subheading', value: 'author', placeholder: 'Author...' },
				{ name: 'ISBN', view: 'subheading', value: 'isbn', placeholder: 'xxxxxxxxxxxxx' },
				'divider',
				{ name: 'Cover', view: 'cover', value: 'cover' },
				{ name: 'Series', view: 'body', value: 'series', placeholder: 'Series name...'},
				{ name: 'Volume', view: 'body', value: 'volume', placeholder: 'Volume #...'},
				'divider',
				{ name: 'Date Added', view: 'body', value: 'added', placeholder: 'xx.xx.xx'},
				{ name: 'Status', view: 'body', value: 'status', placeholder: 'Plan to Read'},
				{ name: 'Tags', view: 'body', value: 'tags', placeholder: 'Tags...'},
				{ name: 'notes', view: 'body', value: 'notes', placeholder: 'Write some notes...'},

			]
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
	Shelv.database_type = db.dbtype;
	Shelv.groups = db.groups;
});

function _(obj) { return {...obj} };