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

		isbn_search: {
			id: '',
			result: false
		},

		working_index: false,
		working_instance: false,

		statusoptions: ['Plan to Read', 'Reading', 'Complete', '']

	},

	watch: {
		database_name: (next, prev) => {
			socket.emit('data_overwrite_request', next);
		},
		window: (next, prev) => {
			if (prev === 'barcode') {};
			if (next === 'barcode') { Shelv.scanner_init() };
		},
		'isbn_search.id': (next, prev) => {
			if (next.length === 13) {

				Shelv.isbn_search.result = 'loading';
				fetch('https://www.googleapis.com/books/v1/volumes?q=isbn:'+next)
				.then(response => response.json()).then((data) => {

					if (data.totalItems > 0) {

						let i = data.items[0].volumeInfo;

						Shelv.isbn_search.result = {
							'title': i.title,
							'author': i.authors.join(', '),
							'isbn': next,
							'cover': i.imageLinks.thumbnail.replace('http', 'https'),

							'series': '',
							'volume': 0,
							'pages': i.pageCount,

							'added': 'Unknown',
							'status': '',
							'notes': ''
						};

						if (Shelv.isbn_search.result.title.includes(', Vol. ')) {
							let i = Shelv.isbn_search.result.title.split(', ');
							Shelv.isbn_search.result.series = i[0];
							Shelv.isbn_search.result.volume = i[1].split(' ')[1];
						};

					} else { Shelv.isbn_search.result = 'error' };

				});


			};
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
			this.saveData();
		},

		saveData() {
			socket.emit('save_data', {
				'main': this.main,
				'type': this.database_type,
				'groups': this.groups
			});
		},

		add_manual() {
			this.window = false;
			this.main.unshift({
				title: 'Unmarked Volume',
				author: 'Unknown',
				isbn: 'xxxxxxxxxxxxx',
				cover: false,
				series: '',
				volume: 0,
				pages: '0',
				added: 'Unknown',
				status: '',
				notes: ''
			});
			this.setView('list');
			this.setInstance(0);
			this.saveData();
		},

		add_isbn() {
			this.window = false;
			this.main.unshift(this.isbn_search.result);
			this.setView('list');
			this.setInstance(0);
			this.saveData();
		},

		scanner_init() {

		}

	}

});


var mediastream;

// Socket endpoints.
socket.on('configfile', (pack)=>{
	Shelv.database_name = pack.open_database; // Currently open database;
	Shelv.database_list = pack.database_list; // List of databases;
});
socket.on('database_load', (db)=>{
	console.log('LOADED DATABASE.')
	Shelv.main = db.main;
	Shelv.database_type = db.type;
	Shelv.groups = db.groups;
});

function _(obj) { return {...obj} };