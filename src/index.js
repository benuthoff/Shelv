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

		database_name: 'Loading Database...',
		database_type: false,
		current_index: 0,

		database_list: [],

		main: [],
		groups: {},

		isbn_search: {
			id: '',
			result: false
		},

		new_db_name_input: '',

		working_index: false,
		working_instance: false

	},

	watch: {
		database_name: (next, prev) => {
			socket.emit('data_request', next);
		},
		window: (next, prev) => {
			// Clear ISBN Search.
			Shelv.isbn_search.id = '';
			Shelv.isbn_search.result = false;
		},
		'isbn_search.id': (next, prev) => {
			if (next.length === 13) {

				Shelv.isbn_search.result = 'loading';

				fetch('https://www.googleapis.com/books/v1/volumes?q=isbn:'+next)
				.then(response => response.json()).then((data) => {

					if (data.totalItems > 0) {

						let i = data.items[0].volumeInfo;

						Shelv.isbn_search.result = {
							'id': Shelv.current_index + 1,

							'title': i.title,
							'author': i.authors.join(', '),
							'isbn': next,
							'cover': i.imageLinks.thumbnail.replace('http', 'https'),

							'series': '',
							'volume': 0,
							'pages': i.pageCount,

							'added': 'Unknown',
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

		// Sets the open page.
		setView(id) {
			this.view = id;
		},

		// Opens the edit dialog for entries.
		setInstance(index) {
			if (this.working_index === index) { // If already open, Close.
				this.working_index = false;
				return;
			};
			this.working_index = index;
			this.working_instance = _(this.main[index]);
		},

		// Saves changes of the open entry.
		saveInstance() {
			this.main[this.working_index] = this.working_instance;
			this.saveData();
		},

		// Saves all data to the file system.
		saveData() {
			socket.emit('save_data', {
				'main': this.main,
				'type': this.database_type,
				'groups': this.groups,
				'index': this.current_index
			});
		},

		updateStats() {
			this.countSeries();
			this.saveData();
		},

		// Counts numbers of volumes present in each series.
		countSeries() {
			let allseries = {};
			this.main.forEach((entry)=>{
				let list = Object.keys(allseries);
				if (!list.includes(entry.series)) {
					allseries[entry.series] = 1;
				} else {
					allseries[entry.series] += 1;
				};
			});
			this.groups['Series'] = allseries;
		},

		series(name) {
			// Get all entries in series.
			let main = this.main.filter( entry => entry.series === name );;		
			// Order all entries by volume #.
			main.sort((a,b)=>{

				let av = parseInt(a.volume);
				let bv = parseInt(b.volume);

				if (av === NaN || bv === NaN || av > bv) { return 1 }
				else if (av < bv) { return -1 }
				else { return 0 };
				
			});
			return main;
		},

		removeInstance() {
			this.main.splice(this.working_index,1);
			this.working_index = false;
			this.window = false;
			this.saveData();
		},

		createNewDB() {
			
		},

		// Adds a blank entry to the database.
		add_manual() {
			// Adds a blank volume to the list.
			this.window = false;
			this.main.unshift({
				id: this.current_index + 1,
				title: 'Unmarked Volume',
				author: 'Unknown',
				isbn: 'xxxxxxxxxxxxx',
				cover: false,
				series: '',
				volume: 0,
				pages: '0',
				added: 'Unknown',
				notes: ''
			});
			this.setView('list');
			this.setInstance(0);
			this.current_index += 1;
			this.saveData();
		},

		// Adds the searched book to the database.
		add_isbn(reset=false) {
			// Hide window, add to main, 
			// look at the item in the list view,
			// and save the data to the fs.
			this.main.unshift(this.isbn_search.result);
			this.current_index += 1;
			this.saveData();
			// 'ADD ANOTHER'
			if (reset) { 
				this.isbn_search.id = '';
				this.isbn_search.result = false;
			} else { // Default
				this.window = false;
				this.setView('list');
				this.setInstance(0);
			};
			

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
	Shelv.current_index = db.index;
});

function _(obj) { return {...obj} };