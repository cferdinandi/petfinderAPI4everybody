(function (root, factory) {
	if ( typeof define === 'function' && define.amd ) {
		define('petfinderAPI', factory(root));
	} else if ( typeof exports === 'object' ) {
		module.exports = factory(root);
	} else {
		root.petfinderAPI = factory(root);
	}
})(window || this, function (root) {

	'use strict';

	//
	// Variables
	//

	var petfinderAPI = {}; // Object for public APIs
	var supports = !!document.querySelector && !!root.addEventListener && !!root.localStorage && !!Array.prototype.indexOf; // Feature test
	var templates = {}; // Object for templates
	var app = {}; // Object for app nodes
	var lists = {}; // Object for pet lists
	var original = {}; // Object for original content and page title
	var settings, eventTimeout, localAPI, localAPIid, baseUrl, total;

	// Default settings
	var defaults = {

		// API Defaults
		key: null,
		shelter: null,
		count: 25,
		status: 'A',
		offset: null,
		expiration: 60,
		reverse: false,

		// Class Hooks
		initClass: 'js-petfinder-api',
		allClass: 'js-petfinder-api-all-pets',
		oneClass: 'js-petfinder-api-one-pet',

		// Miscellaneous
		titlePrefix: '{{name}} | ',
		loading: 'Fetching the latest pet info...',
		noPet: 'Sorry, but this pet is no longer available. <a data-petfinder-async href="{{url.all}}">View available pets.</a>',


		// Lists & Checkboxes
		classPrefix: 'pf-',
		toggleAll: 'Select/Unselect All',

		// Pet photos
		noImage: '',

		// Animal Text
		animalUnknown: '',

		// Breeds Text
		breedDelimiter: ', ',

		// Size Text
		sizeUnknown: 'Not Known',
		sizeS: 'Small',
		sizeM: 'Medium',
		sizeL: 'Large',
		sizeXL: 'Extra Large',

		// Age Text
		ageUnknown: 'Not Known',
		ageBaby: 'Baby',
		ageYoung: 'Young',
		ageAdult: 'Adult',
		ageSenior: 'Senior',

		// Gender Text
		genderUnknown: 'Not Known',
		genderM: 'Male',
		genderF: 'Female',

		// Options Text
		optionsSpecialNeeds: 'Special Needs',
		optionsNoDogs: 'No Dogs',
		optionsNoCats: 'No Cats',
		optionsNoKids: 'No Kids',
		optionsNoClaws: 'No Claws',
		optionsHasShot: 'Has hots',
		optionsHousebroken: 'Housebroken',
		optionsAltered: 'Spayed/Neutered',

		// Multi-Option Text
		optionsNoDogsCatsKids: 'No Dogs/Cats/Kids',
		optionsNoDogsCats: 'No Dogs/Cats',
		optionsNoDogsKids: 'No Dogs/Kids',
		optionsNoCatsKids: 'No Cats/Kids',

		// Contact Info Missing Text
		contactName: '',
		contactEmail: '',
		contactPhone: '',
		contactAddress1: '',
		contactAddress2: '',
		contactCity: '',
		contactState: '',
		contactZip: '',
		contactFax: '',

		// Callbacks
		callbackBefore: function () {},
		callbackAfter: function () {}
	};


	//
	// Methods
	//

	/**
	 * A simple forEach() implementation for Arrays, Objects and NodeLists
	 * @private
	 * @param {Array|Object|NodeList} collection Collection of items to iterate
	 * @param {Function} callback Callback function for each iteration
	 * @param {Array|Object|NodeList} scope Object/NodeList/Array that forEach is iterating over (aka `this`)
	 */
	var forEach = function (collection, callback, scope) {
		if (Object.prototype.toString.call(collection) === '[object Object]') {
			for (var prop in collection) {
				if (Object.prototype.hasOwnProperty.call(collection, prop)) {
					callback.call(scope, collection[prop], prop, collection);
				}
			}
		} else {
			for (var i = 0, len = collection.length; i < len; i++) {
				callback.call(scope, collection[i], i, collection);
			}
		}
	};

	/**
	 * Merge defaults with user options
	 * @private
	 * @param {Object} defaults Default settings
	 * @param {Object} options User options
	 * @returns {Object} Merged values of defaults and options
	 */
	var extend = function ( defaults, options ) {
		var extended = {};
		forEach(defaults, function (value, prop) {
			extended[prop] = defaults[prop];
		});
		forEach(options, function (value, prop) {
			extended[prop] = options[prop];
		});
		return extended;
	};

	/**
	 * Create Petfinder API request URL with callback
	 * @private
	 * @param  {string} callback Name of the callback function to run on load
	 * @return {string}          The API request URL
	 */
	var createRequestURL = function ( callback ) {

		// Setup basic request in JSON format
		var url = 'http://api.petfinder.com/shelter.getPets?format=json';
		var options = '';

		// Add options
		options += '&key=' + settings.key; // API Key
		options += '&id=' + settings.shelter; // Shelter ID
		options += '&count=' + parseInt(settings.count, 10); // Number of pets to retrieve
		options += '&status=' + settings.status; // Status (adoptable, pending, etc.)
		options += '&output=full'; // Output

		// If offset defined, add it to options
		if ( settings.offset ) {
			options += '&offset=' + parseInt(settings.offset, 10);
		}

		// If a callback is defined, add it to options
		if ( callback ) {
			options += '&callback=' + callback;
		}

		return url + options;

	};

	/**
	 * Get JSONP data for cross-domain AJAX requests
	 * @private
	 * @link http://cameronspear.com/blog/exactly-what-is-jsonp/
	 * @param  {string} url The URL of the JSON request
	 */
	var getJSONP = function ( url ) {

		// Create script with url
		var ref = window.document.getElementsByTagName( 'script' )[ 0 ];
		var script = window.document.createElement( 'script' );
		script.src = url;

		// Insert script tag into the DOM (append to <head>)
		ref.parentNode.insertBefore( script, ref );

		// After the script is loaded (and executed), remove it
		script.onload = function () {
			this.remove();
		};

	};

	/**
	 * Save remote API data to localStorage and set variable for use
	 * @public
	 * @param {Object} data API data object from Petfinder
	 */
	petfinderAPI.setAPIData = function ( data ) {

		// If Petfinder API produces an error, return and fallback to localStorage
		if ( data.petfinder.header.status.code.$t !== '100' ) {
			console.log('Unable to get data from Petfinder. Using expired localStorage data instead.');
			setup();
			return;
		}

		// Save API Data to localStorage with expiration date
		var expirationMS = parseInt( settings.expiration, 10 ) * 60 * 1000;
		localAPI = {
			pets: data.petfinder.pets.pet,
			timestamp: new Date().getTime() + expirationMS
		};
		localStorage.setItem( localAPIid, JSON.stringify(localAPI) );

		// Run initial setup
		setup();

	};

	/**
	 * Get API data from localStorage
	 * @private
	 */
	var getAPIData = function () {

		// Get API data from localStorage
		localAPI = JSON.parse( localStorage.getItem( localAPIid ) );

		// If local data exists and hasn't expired, use it
		if ( localAPI ) {
			if ( new Date().getTime() < localAPI.timestamp ) {
				setup();
				return;
			}
		}

		// If local data doesn't exist or has expired, get fresh data from Petfinder
		var url = createRequestURL( 'petfinderAPI.setAPIData' );
		getJSONP( url );

	};

	/**
	 * Update the document title
	 * @private
	 * @param  {string} name Name of current pet
	 */
	var updateTitle = function ( name ) {
		var title = name ? settings.titlePrefix + original.title : original.title; // Set title
		title = title.replace( /\{\{name\}\}/, name ); // Replace {{name}} placeholder with pet name
		document.title = title; // Update title
	};

	/**
	 * Get pet attribute and convert into human-readable format
	 * @private
	 * @param  {Object} pet   The pet to get an option for
	 * @param  {String} type  Type of value (size, age, etc.)
	 * @param  {String} start Default value
	 * @return {String}       Converted value
	 */
	var getPetAttribute = function ( pet, type, start ) {

		// Set default value
		var attribute = start;

		/**
		 * Check set of options for the attribute
		 * @private
		 * @param  {String} option Option to look for
		 * @param  {String} value  Value to use if it exists
		 */
		var getPetOption = function ( option, value ) {
			if ( !pet.options.option ) return;
			forEach(pet.options.option, function (opt) {
				if ( opt.$t === option ) {
					attribute = value;
				}
			});
		};

		// Sanitize description and add links
		if ( type === 'description' ) {
			attribute = sanitizeDescription( pet.description.$t );
			attribute = addLinks( attribute );
			attribute = addMailtos( attribute );
			attribute = '<div style="white-space: pre-wrap;">' + attribute + '</div>';
		}

		// Generate string of breeds, separated by a delimiter
		if ( type === 'breeds' ) {
			if ( Object.prototype.toString.call( pet.breeds.breed ) === '[object Object]' ) {
				attribute = pet.breeds.breed.$t;
				return attribute;
			}

			forEach(pet.breeds.breed, function (breed, index) {
				attribute += index === 0 ? '' : settings.breedDelimiter;
				attribute += breed.$t;
			});
		}

		// Translate pet size into human-readable format
		if ( type === 'size' ) {
			if ( pet.size.$t === 'S' ) attribute = settings.sizeS;
			if ( pet.size.$t === 'M' ) attribute = settings.sizeM;
			if ( pet.size.$t === 'L' ) attribute = settings.sizeL;
			if ( pet.size.$t === 'XL' ) attribute = settings.sizeXL;
		}

		// Translate pet age into preferred name
		if ( type === 'age' ) {
			if ( pet.age.$t === 'Baby' ) attribute = settings.ageBaby;
			if ( pet.age.$t === 'Young' ) attribute = settings.ageYoung;
			if ( pet.age.$t === 'Adult' ) attribute = settings.ageAdult;
			if ( pet.age.$t === 'Senior' ) attribute = settings.ageSenior;
		}

		// Translate pet gender into human-readable format
		if ( type === 'gender' ) {
			if ( pet.sex.$t === 'M' ) attribute = settings.genderM;
			if ( pet.sex.$t === 'F' ) attribute = settings.genderF;
		}

		// Generate a string of options
		if ( type === 'multiOptions' ) {
			var noCats, noDogs, noKids;
			if ( !pet.options.option ) return;
			forEach(pet.options.option, function (opt) {
				if ( opt.$t === 'noCats' ) { noCats = true; }
				if ( opt.$t === 'noDogs' ) { noDogs = true; }
				if ( opt.$t === 'noKids' ) { noKids = true; }
			});

			// Create content for pet options section
			if ( noCats === true && noDogs === true && noKids === true ) { attribute = settings.optionsNoDogsCatsKids; }
			if ( noCats === true && noDogs === true ) { attribute = settings.optionsNoDogsCats; }
			if ( noDogs === true && noKids === true ) { attribute = settings.optionsNoDogsKids; }
			if ( noCats === true && noKids === true ) { attribute = settings.optionsNoCatsKids; }
			if ( noDogs === true ) { attribute = settings.optionsNoDogs; }
			if ( noCats === true ) { attribute = settings.optionsNoCats; }
			if ( noKids === true ) { attribute = settings.optionsNoKids; }
		}
		if ( type === 'specialNeeds' ) { getPetOption( 'specialNeeds', settings.optionsSpecialNeeds ); }
		if ( type === 'noDogs' ) { getPetOption( 'noDogs', settings.optionsNoDogs ); }
		if ( type === 'noCats' ) { getPetOption( 'noCats', settings.optionsNoCats ); }
		if ( type === 'noKids' ) { getPetOption( 'noKids', settings.optionsNoKids ); }
		if ( type === 'noClaws' ) { getPetOption( 'noClaws', settings.optionsNoClaws ); }
		if ( type === 'hasShot' ) { getPetOption( 'hasShots', settings.optionsHasShots ); }
		if ( type === 'housebroken' ) { getPetOption( 'housebroken', settings.optionsHousebroken ); }
		if ( type === 'altered' ) { getPetOption( 'altered', settings.optionsAltered ); }

		return attribute;

	};

	/**
	 * Get photo of pet
	 * @param  {Object} pet  Pet to get photo of
	 * @param  {String} size Size of the photo to get
	 * @param  {Number} num  Which photo to get
	 * @return {String}      URL of the photo
	 */
	var getPetPhoto = function ( pet, size, num ) {

		// If pet has no photos, end method
		if ( pet.media.photos.photo.count === 0 ) return '';

		// Variables
		var image = settings.noImage;
		var quality;
		if ( size === 'large' ) { quality = 'x'; }
		if ( size === 'medium' ) { quality = 'pn'; }
		if ( size === 'thumbSmall' ) { quality = 't'; }
		if ( size === 'thumbMedium' ) { quality = 'pnt'; }
		if ( size === 'thumbLarge' ) { quality = 'fpm'; }

		// Loop through available photos until finding a match
		forEach(pet.media.photos.photo, function (photo) {
			if ( photo['@size'] === quality && photo['@id'] === num ) {
				image = photo.$t;
				return;
			}
		});

		return image;

	};

	/**
	 * Get contact info for a pet
	 * @param  {Object} pet  The pet
	 * @param  {String} type Type of contact info to get
	 * @return {String}      The contact info
	 */
	var getPetContact = function ( pet, type ) {

		// Default info value
		var info = '';

		// Set info based on type
		if ( type === 'name' ) { info = pet.contact.name && pet.contact.name.$t ? pet.contact.name.$t : settings.contactName; }
		if ( type === 'email' ) { info = pet.contact.email && pet.contact.email.$t ? pet.contact.email.$t : settings.contactEmail; }
		if ( type === 'phone' ) { info = pet.contact.phone && pet.contact.phone.$t ? pet.contact.phone.$t : settings.contactPhone; }
		if ( type === 'address1' ) { info = pet.contact.address1 && pet.contact.address1.$t ? pet.contact.address1.$t : settings.contactAddress1; }
		if ( type === 'address2' ) { info = pet.contact.address2 && pet.contact.address2.$t ? pet.contact.address2.$t : settings.contactAddress2; }
		if ( type === 'city' ) { info = pet.contact.city && pet.contact.city.$t ? pet.contact.city.$t : settings.contactCity; }
		if ( type === 'state' ) { info = pet.contact.state && pet.contact.state.$t ? pet.contact.state.$t : settings.contactState; }
		if ( type === 'zip' ) { info = pet.contact.zip && pet.contact.zip.$t ? pet.contact.zip.$t : settings.contactZip; }
		if ( type === 'fax' ) { info = pet.contact.fax && pet.contact.fax.$t ? pet.contact.fax.$t : settings.contactFax; }

		return info;

	};

	/**
	 * Replace plain text links with URLs
	 * @private
	 * @param {String} text Text to add URLs to
	 */
	var addLinks = function ( text ) {
		if ( !text || text === '' ) return; // If no text is supplied, end method
		return text.replace(/(http|https|ftp|ftps)\:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(\/\S*)?/g, '<a href="$&" rel="nofollow">$&</a>');
	};

	/**
	 * Replace plain text email addresses with mailto links
	 * @private
	 * @param {String} text Text to add links to
	 */
	var addMailtos = function ( text ) {
		if ( !text || text === '' ) return; // If no text is supplied, end method
		return text.replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4})/g, '<a href="mailto:$&">$&</a>');
	};

	/**
	 * Remove unwanted text from pet descriptions
	 * @private
	 * @param  {String} text The text to sanitize
	 * @return {String}      Sanitized text
	 */
	var sanitizeDescription = function ( text ) {
		if ( !text || text === '' ) return; // If no text is supplied, end method
		return text
			.replace( /<p><\/p>/g, '' )
			.replace( /<p> <\/p>/g, '' )
			.replace( /<p>&nbsp;<\/p>/g, '' )
			.replace( /&nbsp;/g, '' )
			.replace( /<span>/g, '' )
			.replace( /<\/span>/g, '' )
			.replace( /<font>/g, '' )
			.replace( /<\/font>/g, '' );
	};

	/**
	 * Remove spaces from string
	 * @private
	 * @param  {String} text String to condense
	 * @return {String}      Condensed string
	 */
	var condenseString = function ( text, prefix ) {
		if ( !text || text === '' ) return; // If no text is supplied, end method
		if ( prefix ) { text = settings.classPrefix + text; } // If a prefix is set, add it
		return text
			.replace( /\(/g, '' )
			.replace( /\)/g, '' )
			.replace( /\&/g, '-' )
			.replace( /\//g, '-' )
			.replace( / /g, '-' )
			.toLowerCase();
	};

	/**
	 * Remove spaces from array elements and combine into a string
	 * @private
	 * @param  {Array} arr      The array of elements
	 * @param  {Boolean} prefix If true, add prefix to each string
	 * @return {String}         Combined, condensed array values
	 */
	var condenseArray = function ( arr, prefix ) {
		var text = '';
		forEach(arr, function (value) {
			text += ' ' + condenseString( value.$t, prefix );
		});
		return text;
	};

	var getBreeds = function ( pet ) {

		if ( Object.prototype.toString.call( pet.breeds.breed ) === '[object Object]' ) {
			return ' ' + condenseString( pet.breeds.breed.$t, true );
		}

		var breeds = '';
		forEach(pet.breeds.breed, function (breed, index) {
			breeds += ' ' + condenseString( breed.$t, true );
		});
		return breeds;

	};

	/**
	 * Generate classes for all pet attributes
	 * @private
	 * @param  {Object} pet Pet to generate classes for
	 * @return {String}     Pet classes
	 */
	var getPetClasses = function ( pet ) {
		return [
			settings.classPrefix + 'pet',
			condenseString( getPetAttribute( pet, 'age', settings.ageUnknown ), true ),
			condenseString( pet.animal.$t, true ),
			getBreeds( pet ),
			condenseString( getPetAttribute( pet, 'specialNeeds', '' ), true ),
			condenseString( getPetAttribute( pet, 'noDogs', '' ), true ),
			condenseString( getPetAttribute( pet, 'noCats', '' ), true ),
			condenseString( getPetAttribute( pet, 'noKids', '' ), true ),
			condenseString( getPetAttribute( pet, 'noClaws', '' ), true ),
			condenseString( getPetAttribute( pet, 'hasShots', '' ), true ),
			condenseString( getPetAttribute( pet, 'housebroken', '' ), true ),
			condenseString( getPetAttribute( pet, 'altered', '' ), true ),
			condenseString( getPetAttribute( pet, 'gender', settings.genderUnknown ), true ),
			condenseString( getPetAttribute( pet, 'size', settings.sizeUnknown ), true )
		].join( ' ' );
	};

	/**
	 * Create sorted lists of attributes based on available pets
	 * @private
	 * @param  {String} type  Characteristic to create a list for
	 * @param  {String} start Default value of attribute
	 * @return {Array}        Array of available attributes
	 */
	var createList = function ( type, start ) {

		// If list already cached, use that
		if ( lists[type] ) return lists[type];

		// Variables
		var list = [];
		var listTemp = [];

		// Loop through pet attributes and push unique attributes to an array
		forEach(localAPI.pets, function ( pet ) {

			// Get attribute in human-readable form
			var attribute = getPetAttribute( pet, type, start );

			// If type is breeds, split by delimiter and add to array if not already there
			if ( type === 'breeds' ) {
				var breeds = attribute.split( settings.breedDelimiter );
				forEach(breeds, function ( breed ) {
					if ( list.indexOf( breed ) === -1 ) {
						list.push( breed );
					}
				});
				return;
			}

			// Otherwise, add to array if not already there
			if ( list.indexOf( attribute ) === -1 ) {
				list.push( attribute );
			}
		});

		// Sort list alphabetically
		list.sort();

		// If creating list of sizes, sort smallest to largest
		if ( type === 'size' ) {
			if ( list.indexOf( settings.sizeS ) !== -1 ) listTemp.push( settings.sizeS );
			if ( list.indexOf( settings.sizeM ) !== -1 ) listTemp.push( settings.sizeM );
			if ( list.indexOf( settings.sizeL ) !== -1 ) listTemp.push( settings.sizeL );
			if ( list.indexOf( settings.sizeXL ) !== -1 ) listTemp.push( settings.sizeXL );
			list = listTemp;
		}

		// If creating a list of ages, sort youngest to oldest
		if ( type === 'age' ) {
			if ( list.indexOf( settings.ageBaby ) !== -1 ) listTemp.push( settings.ageBaby );
			if ( list.indexOf( settings.ageYoung ) !== -1 ) listTemp.push( settings.ageYoung );
			if ( list.indexOf( settings.ageAdult ) !== -1 ) listTemp.push( settings.ageAdult );
			if ( list.indexOf( settings.ageSenior ) !== -1 ) listTemp.push( settings.ageSenior );
			list = listTemp;
		}

		// Cache list for reuse later
		lists[type] = list;

		return list;
	};

	/**
	 * Create a collection of list items for a pet attribute
	 * @private
	 * @param  {String} type  Type of attribute to create list items for
	 * @param  {String} start Default value of attribute
	 * @return {String}       A collection of list items
	 */
	var createListItems = function ( type, start ) {

		// Variables
		var markup = '';
		var listItems = createList( type, start );

		// Create a list item for each attribute
		forEach(listItems, function (item) {
			markup +=
				'<li>' + item +'</li>';
		});

		return markup;
	};

	/**
	 * Create checkboxes for a pet attribute
	 * @private
	 * @param  {String} type    Type of attribute to create list items for
	 * @param  {String} start   Default value of attribute
	 * @param  {Boolean} toggle If true, add select/unselect all toggle checkbox
	 * @return {String}         Checkboxes
	 */
	var createCheckboxes = function ( type, start, toggle ) {

		// Variables
		var markup = '';
		var toggleAll = '';
		var sort = type === 'breeds' ? 'breeds' : 'attributes';
		// var subtype = null;
		// if ( type === 'breeds' ) { subtype = 'breed'; }
		// if ( type === 'options' ) { subtype = 'option'; }
		var listItems = createList( type, start );

		// For each attribute, create a checkbox
		forEach(listItems, function (item) {
			var target = condenseString( item, true );
			markup +=
				'<label>' +
					'<input type="checkbox" data-petfinder-sort="' + sort + '" data-petfinder-sort-type="' + type + '" data-petfinder-sort-target=".' + target + '" checked>' +
					item +
				'</label>';
		});

		// Add select/unselect all toggle if enabled
		if ( toggle ) {
			toggleAll =
				'<label>' +
					'<input type="checkbox" data-petfinder-sort="toggle" data-petfinder-sort-target="[data-petfinder-sort-type=' + type + ']" checked>' +
					settings.toggleAll +
				'</label>';
		}

		return toggleAll + markup;

	};

	/**
	 * Get templates for pet data from DOM
	 * @private
	 */
	var getTemplates = function () {

		// Get templates
		var allPets = document.querySelector( '[data-petfinder-template="all"]' );
		var onePet = document.querySelector( '[data-petfinder-template="one"]' );
		var asideAllPets = document.querySelector( '[data-petfinder-template="aside-all"]' );
		var asideOnePet = document.querySelector( '[data-petfinder-template="aside-one"]' );

		// If templates exist, cache template content
		if ( allPets ) { templates.allPets = allPets.innerHTML; }
		if ( onePet ) { templates.onePet = onePet.innerHTML; }
		if ( asideAllPets ) { templates.asideAllPets = asideAllPets.innerHTML; }
		if ( asideOnePet ) { templates.asideOnePet = asideOnePet.innerHTML; }

	};

	/**
	 * Replace template placeholders with content
	 * @private
	 * @param  {Object} pet      The pet to generate markup for
	 * @param  {String} template The template file to use when generating markup
	 * @return {String}          The markup
	 */
	var createTemplateMarkup = function ( pet, template, index ) {
		if ( pet ) {
			return template
				.replace( /\{\{name\}\}/g, pet.name.$t )
				.replace( /\{\{id\}\}/g, pet.id.$t )
				.replace( /\{\{animal\}\}/, pet.animal.$t )
				.replace( /\{\{age\}\}/, getPetAttribute( pet, 'age', settings.ageUnknown ) )
				.replace( /\{\{gender\}\}/, getPetAttribute( pet, 'gender', settings.genderUnknown ))
				.replace( /\{\{size\}\}/, getPetAttribute( pet, 'size', settings.sizeUnknown ) )
				.replace( /\{\{breeds\}\}/, getPetAttribute( pet, 'breeds', '' ) )
				.replace( /\{\{description\}\}/, getPetAttribute( pet, 'description', '' ) )
				.replace( /\{\{photo.1.large\}\}/g, getPetPhoto( pet, 'large', '1' ) )
				.replace( /\{\{photo.2.large\}\}/g, getPetPhoto( pet, 'large', '2' ) )
				.replace( /\{\{photo.3.large\}\}/g, getPetPhoto( pet, 'large', '3' ) )
				.replace( /\{\{photo.1.medium\}\}/g, getPetPhoto( pet, 'medium', '1' ) )
				.replace( /\{\{photo.2.medium\}\}/g, getPetPhoto( pet, 'medium', '2' ) )
				.replace( /\{\{photo.3.medium\}\}/g, getPetPhoto( pet, 'medium', '3' ) )
				.replace( /\{\{photo.1.thumbnail.small\}\}/g, getPetPhoto( pet, 'thumbSmall', '1' ) )
				.replace( /\{\{photo.2.thumbnail.small\}\}/g, getPetPhoto( pet, 'thumbSmall', '2' ) )
				.replace( /\{\{photo.3.thumbnail.small\}\}/g, getPetPhoto( pet, 'thumbSmall', '3' ) )
				.replace( /\{\{photo.1.thumbnail.medium\}\}/g, getPetPhoto( pet, 'thumbMedium', '1' ) )
				.replace( /\{\{photo.2.thumbnail.medium\}\}/g, getPetPhoto( pet, 'thumbMedium', '2' ) )
				.replace( /\{\{photo.3.thumbnail.medium\}\}/g, getPetPhoto( pet, 'thumbMedium', '3' ) )
				.replace( /\{\{photo.1.thumbnail.large\}\}/g, getPetPhoto( pet, 'thumbLarge', '1' ) )
				.replace( /\{\{photo.2.thumbnail.large\}\}/g, getPetPhoto( pet, 'thumbLarge', '2' ) )
				.replace( /\{\{photo.3.thumbnail.large\}\}/g, getPetPhoto( pet, 'thumbLarge', '3' ) )
				.replace( /\{\{options.multi\}\}/, getPetAttribute( pet, 'multiOptions', '' ) )
				.replace( /\{\{options.specialNeeds\}\}/, getPetAttribute( pet, 'specialNeeds', '' ) )
				.replace( /\{\{options.noDogs\}\}/, getPetAttribute( pet, 'noDogs', '' ) )
				.replace( /\{\{options.noCats\}\}/, getPetAttribute( pet, 'noCats', '' ) )
				.replace( /\{\{options.noKids\}\}/, getPetAttribute( pet, 'noKids', '' ) )
				.replace( /\{\{options.noClaws\}\}/, getPetAttribute( pet, 'noClaws', '' ) )
				.replace( /\{\{options.hasShots\}\}/, getPetAttribute( pet, 'hasShots', '' ) )
				.replace( /\{\{options.housebroken\}\}/, getPetAttribute( pet, 'housebroken', '' ) )
				.replace( /\{\{options.altered\}\}/, getPetAttribute( pet, 'altered', '' ) )
				.replace( /\{\{contact.name\}\}/, getPetContact( pet, 'name' ) )
				.replace( /\{\{contact.email\}\}/, getPetContact( pet, 'email' ) )
				.replace( /\{\{contact.phone\}\}/, getPetContact( pet, 'phone' ) )
				.replace( /\{\{contact.address1\}\}/, getPetContact( pet, 'address1' ) )
				.replace( /\{\{contact.address2\}\}/, getPetContact( pet, 'address2' ) )
				.replace( /\{\{contact.city\}\}/, getPetContact( pet, 'city' ) )
				.replace( /\{\{contact.state\}\}/, getPetContact( pet, 'state' ) )
				.replace( /\{\{contact.zip\}\}/, getPetContact( pet, 'zip' ) )
				.replace( /\{\{contact.fax\}\}/, getPetContact( pet, 'fax' ) )
				.replace( /\{\{url.all\}\}/g, baseUrl )
				.replace( /\{\{url.pet\}\}/g, baseUrl + '?petID=' + pet.id.$t )
				.replace( /\{\{url.petfinder\}\}/g, 'https://www.petfinder.com/petdetail/' + pet.id.$t )
				.replace( /\{\{classes\}\}/, getPetClasses( pet ) )
				.replace( /\{\{number\}\}/g, index )
				.replace( /\{\{total\}\}/g, total );
		}

		return template
			.replace( /\{\{list.ages\}\}/, createListItems( 'age', settings.ageUnknown ) )
			.replace( /\{\{list.animals\}\}/, createListItems( 'animal', settings.animalUnknown ) )
			.replace( /\{\{list.breeds\}\}/, createListItems( 'breeds', '', 'breed' ) )
			.replace( /\{\{list.options\}\}/, createListItems( 'options', '', 'option' ) )
			.replace( /\{\{list.genders\}\}/, createListItems( 'sex', settings.genderUnknown ) )
			.replace( /\{\{list.sizes\}\}/, createListItems( 'size', settings.sizeUnknown ) )
			.replace( /\{\{checkbox.ages\}\}/, createCheckboxes( 'age', settings.ageUnknown ) )
			.replace( /\{\{checkbox.animals\}\}/, createCheckboxes( 'animal', settings.animalUnknown ) )
			.replace( /\{\{checkbox.breeds\}\}/, createCheckboxes( 'breeds', '' ) )
			.replace( /\{\{checkbox.options\}\}/, createCheckboxes( 'options', '' ) )
			.replace( /\{\{checkbox.genders\}\}/, createCheckboxes( 'gender', settings.genderUnknown ) )
			.replace( /\{\{checkbox.sizes\}\}/, createCheckboxes( 'size', settings.sizeUnknown ) )
			.replace( /\{\{checkbox.ages.toggle\}\}/, createCheckboxes( 'age', settings.ageUnknown, true ) )
			.replace( /\{\{checkbox.animals.toggle\}\}/, createCheckboxes( 'animal', settings.animalUnknown, true ) )
			.replace( /\{\{checkbox.breeds.toggle\}\}/, createCheckboxes( 'breeds', '', true ) )
			.replace( /\{\{checkbox.options.toggle\}\}/, createCheckboxes( 'options', '', true ) )
			.replace( /\{\{checkbox.genders.toggle\}\}/, createCheckboxes( 'gender', settings.genderUnknown, true ) )
			.replace( /\{\{checkbox.sizes.toggle\}\}/, createCheckboxes( 'size', settings.sizeUnknown, true ) )
			.replace( /\{\{total\}\}/g, total );
	};

	/**
	 * Update the URL
	 * @private
	 * @param {Element} anchor The element to scroll to
	 * @param {Boolean} url Whether or not to update the URL history
	 */
	var updateURL = function ( url ) {
		if ( !history.pushState ) return; // If pushState isn't support, end method
		history.pushState( null, null, url );
	};

	/**
	 * Get pet data by ID
	 * @private
	 * @param  {String} petID The pet's ID
	 * @return {Object}       The pet
	 */
	var getPetByID = function ( petID ) {
		var petData = {};
		forEach(localAPI.pets, function (pet, index) {
			if ( pet.id.$t === petID ) {
				petData.pet = pet;
				petData.number = index.toString();
			}
		});
		return petData;
	};

	/**
	 * Render aside template in the DOM
	 * @private
	 * @param  {String} template Template for aside content
	 */
	var showAside = function ( template ) {

		// If no aside container exists, end method
		if ( !app.aside ) return;

		// Generate markup and add it to the container
		var markup = template ? createTemplateMarkup( null, template ) : '';
		app.aside.innerHTML = markup;

	};

	/**
	 * Render all pets template in the DOM
	 * @private
	 */
	var showAllPets = function () {

		// Create markup for each pet
		var markup = '';
		forEach(localAPI.pets, function (pet, index) {
			markup += createTemplateMarkup( pet, templates.allPets, index );
		});

		// Add markup to the DOM
		app.main.innerHTML = markup;

		// Update the page title
		updateTitle();

		// Update class hooks on the <html> element
		document.documentElement.classList.add( settings.allClass );
		document.documentElement.classList.remove( settings.oneClass );

	};

	/**
	 * Render one pet template in the DOM
	 * @private
	 * @param {String} petID The ID of the pet to display
	 */
	var showOnePet = function ( petID ) {

		// Get the pet's API data
		var petData = getPetByID( petID );

		// If no pet is a match or no template exists, show error message
		if ( !petData.pet || !petData.number ) {
			app.main.innerHTML = settings.noPet.replace( /\{\{url.all\}\}/, baseUrl );
			return;
		}

		// Create markup for the pet
		var markup = createTemplateMarkup( petData.pet, templates.onePet, petData.number );

		// Add markup to the DOM
		app.main.innerHTML = markup;

		// Update the page title
		updateTitle( petData.pet.name.$t );

		// Update class hooks on the <html> element
		document.documentElement.classList.add( settings.oneClass );
		document.documentElement.classList.remove( settings.allClass );

	};

	/**
	 * Render loading icon and text while fetching data
	 * @private
	 */
	var showLoading = function () {
		if ( settings.loading ) {
			app.main.innerHTML = settings.loading;
		}
	};

	/**
	 * Render content from the petfinder API
	 * @private
	 * @param  {Object} pet   The pet to generate content for. If null, generate content for all pets.
	 * @param  {Boolean} push If true, update URL after generating content
	 */
	var run = function ( pet, push ) {

		// Callback before content is rendered
		settings.callbackBefore();

		// Scroll to the top of the page
		root.scrollTo( 0, 0 );

		// If a "one pet" page, generate content for pet and update URL
		if ( pet ) {
			showOnePet( pet[1] );
			showAside( templates.asideOnePet );
			if ( push ) {
				updateURL( baseUrl + '?petID=' + pet[1] );
			}
			settings.callbackAfter(); // Run callback after content is rendered
			return;
		}

		// Generate content for all pets and update URL
		showAllPets();
		showAside( templates.asideAllPets );
		if ( push ) {
			updateURL( baseUrl );
		}

		// Run callback after content is rendered
		settings.callbackAfter();

	};

	/**
	 * Generate initial content after API is loaded
	 * @private
	 */
	var setup = function () {

		// If no API data is available, reset DOM to original state and log error
		if ( !localAPI ) {
			app.main.innerHTML = original.content;
			console.log( 'Unable to retrieve Petfinder data from the API or localStorage.' );
			return;
		}

		// Reverse pet data order if enabled
		if ( settings.reverse ) {
			localAPI.reverse();
		}


		// Get count of pets
		total = localAPI.pets.length;

		// Determine if its a "one pet" or "all pets" page
		var pet = /[\\?&]petID=([^&#]*)/i.exec(root.location.href);

		// Render content in the DOM
		run( pet, true );

	};

	/**
	 * Asynchronously load pet data
	 * @private
	 * @param event The click event
	 */
	var eventHandler = function (event) {

		// If pushState isn't supported, end method and load pet data via reload
		if ( !history.pushState ) return;

		// Variables
		var toggle = event.target;
		var reg = new RegExp( baseUrl );

		// If async link, prevent default behavior and load pet data asynchronously
		if ( toggle.hasAttribute( 'data-petfinder-async' ) ) {
			event.preventDefault();
			var pet = /[\\?&]petID=([^&#]*)/i.exec(toggle);
			run( pet, true );
		}

	};

	/**
	 * Refresh pet content on popevent
	 * @param  {Event} event The popevent
	 */
	var popEventHandler = function (event) {

		// If pushState isn't supported, end method
		if ( !history.pushState ) return;

		// Determine if new state is for "one pet" or "all pets"
		var pet = /[\\?&]petID=([^&#]*)/i.exec(root.location.href);

		// Render pet data in the DOM
		run( pet );

	};

	/**
	 * Destroy the current initialization.
	 * @public
	 */
	petfinderAPI.destroy = function () {

		// If plugin isn't already initialized, end method
		if ( !settings ) return;

		// Remove class hooks
		document.documentElement.classList.remove( settings.initClass );
		document.documentElement.classList.remove( settings.allClass );
		document.documentElement.classList.remove( settings.oneClass );

		// Reset content and page title
		if ( app.main && original.content ) { app.main.innerHTML = original.content; }
		if ( app.aside ) { app.aside.innerHTML = ''; }
		if ( original.title ) { document.title = original.title; }

		// Remove event listeners
		document.removeEventListener('click', eventHandler, false);

		// Reset variables
		templates = {};
		app = {};
		lists = {};
		original = {};
		settings = null;
		eventTimeout = null;
		localAPI = null;
		localAPIid = null;
		baseUrl = null;
		total = null;

	};

	/**
	 * Initialize Plugin
	 * @public
	 * @param {Object} options User settings
	 */
	petfinderAPI.init = function ( options ) {

		// Feature test
		if ( !supports ) return;

		// Destroy any existing initializations
		petfinderAPI.destroy();

		// Merge user options with defaults
		settings = extend( defaults, options || {} );

		// If API key or shelter ID are not provided, end init and log error
		if ( !settings.key || !settings.shelter ) {
			console.log( 'You must provide a Petfinder API key and shelter ID to use petfinderAPI4everybody.js' );
			return;
		}

		// Add class to HTML element to activate conditional CSS
		document.documentElement.classList.add( settings.initClass );

		// Variables
		localAPIid = [ settings.key, settings.shelter, settings.count, settings.status, settings.offset ].join('');
		app.main = document.querySelector('[data-petfinder-app="main"]');
		app.aside = document.querySelector('[data-petfinder-app="aside"]');
		original.content = app.main.innerHTML;
		original.title = document.title;
		baseUrl = [root.location.protocol, '//', root.location.host, root.location.pathname].join('');
		getTemplates();

		// Show loading icon and fetch Petfinder API data
		showLoading();
		getAPIData();

		// Listen for click and pop events
		document.addEventListener('click', eventHandler, false);
		root.onpopstate = popEventHandler;

	};


	//
	// Public APIs
	//

	return petfinderAPI;

});