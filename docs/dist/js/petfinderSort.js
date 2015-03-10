/**
 * petfinderAPI4everybody v0.4.2
 * A JavaScript plugin that makes it easy for anyone to use the Petfinder API, by Chris Ferdinandi.
 * http://github.com/cferdinandi/petfinderAPI4everybody
 * 
 * Free to use under the MIT License.
 * http://gomakethings.com/mit/
 */

(function (root, factory) {
	if ( typeof define === 'function' && define.amd ) {
		define('petfinderSort', factory(root));
	} else if ( typeof exports === 'object' ) {
		module.exports = factory(root);
	} else {
		root.petfinderSort = factory(root);
	}
})(this, function (root) {

	'use strict';

	//
	// Variables
	//

	var petfinderSort = {}; // Object for public APIs
	var supports = !!document.querySelector && !!root.addEventListener; // Feature test
	var sessionID = 'petfinderSortStates'; // sessionStorage ID
	var states = {}; // Object for checkbox states
	var settings, eventTimeout, pets, sortBreeds, sortAttributes, sortToggles, hideAll;

	// Default settings
	var defaults = {
		initClass: 'js-petfinder-sort',
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
	 * Get the closest matching element up the DOM tree
	 * @param {Element} elem Starting element
	 * @param {String} selector Selector to match against (class, ID, or data attribute)
	 * @return {Boolean|Element} Returns false if not match found
	 */
	var getClosest = function (elem, selector) {
		var firstChar = selector.charAt(0);
		for ( ; elem && elem !== document; elem = elem.parentNode ) {
			if ( firstChar === '.' ) {
				if ( elem.classList.contains( selector.substr(1) ) ) {
					return elem;
				}
			} else if ( firstChar === '#' ) {
				if ( elem.id === selector.substr(1) ) {
					return elem;
				}
			} else if ( firstChar === '[' ) {
				if ( elem.hasAttribute( selector.substr(1, selector.length - 2) ) ) {
					return elem;
				}
			}
		}
		return false;
	};

	/**
	 * Save the current state of a checkbox
	 * @private
	 * @param  {Node} checkbox The checkbox
	 */
	var saveCheckedState = function ( checkbox ) {

		// If sessionStorage isn't supported, end method
		if ( !root.sessionStorage ) return;

		// Get checkbox target
		var name = checkbox.getAttribute( 'data-petfinder-sort-target' );

		// If checkbox isn't checked, save state in sessionStorage
		if ( checkbox.checked === false ) {
			states[name] = 'unchecked';
			sessionStorage.setItem( sessionID, JSON.stringify(states) );
			return;
		}

		// If checkbox is checked, remove state from sessionStorage
		delete states[name];
		sessionStorage.setItem( sessionID, JSON.stringify(states) );

	};

	/**
	 * Set checkbox state based on sessionStorage data
	 * @private
	 * @param  {Node} checkbox The checkbox
	 */
	var setCheckedState = function ( checkbox ) {

		// If sessionStorage isn't supported, end method
		if ( !root.sessionStorage ) return;

		// Get checkbox target and sessionStorage data
		var name = checkbox.getAttribute( 'data-petfinder-sort-target' );
		var status = JSON.parse( sessionStorage.getItem( sessionID ) );

		// If checkbox is in sessionStorage, update it's state
		if ( status && status[name] && status[name] === 'unchecked' ) {
			checkbox.checked = false;
		}

	};

	/**
	 * Get state of all checkboxes
	 * @private
	 */
	var getCheckedStates = function () {
		forEach(sortBreeds, function (checkbox) { setCheckedState( checkbox ); });
		forEach(sortAttributes, function (checkbox) { setCheckedState( checkbox ); });
		forEach(sortToggles, function (checkbox) { setCheckedState( checkbox ); });
	};

	/**
	 * Show or hide a node in the DOM
	 * @private
	 * @param  {Node}    elem  The node to show or hide
	 * @param  {Boolean} hide  If true, hide node. Otherwise show.
	 */
	var toggleVisibility = function ( elem, hide ) {
		if ( hide ) {
			elem.style.display = 'none';
			elem.style.visibility = 'hidden';
			return;
		}
		elem.style.display = 'block';
		elem.style.visibility = 'visible';
	};

	/**
	 * Toggle all checkboxes in a category
	 * @private
	 * @param  {Node} checkbox The checkbox
	 */
	var toggleAll = function ( checkbox ) {

		// Get checkbox targets
		var targets = document.querySelectorAll( checkbox.getAttribute( 'data-petfinder-sort-target' ) );

		// If checkbox is checked, select all checkboxes
		if ( checkbox.checked === true ) {
			forEach(targets, function (target) {
				target.checked = true;
				saveCheckedState( target );
			});
			return;
		}

		// If checkbox is unchecked, unselect all checkboxes
		forEach(targets, function (target) {
			target.checked = false;
			saveCheckedState( target );
		});

	};

	/**
	 * Sort pets based on checkbox selections
	 * @private
	 */
	var sortPets = function () {

		// Hide or show all pets
		forEach(pets, function (pet) {

			// If breed sorting is available, hide all pets by default
			if ( hideAll ) {
				toggleVisibility( pet, true );
				return;
			}

			// Otherwise, show all pets by default
			toggleVisibility( pet );

		});

		// If breed is checked, show matching pets
		forEach(sortBreeds, function (checkbox) {
			if ( checkbox.checked === true ) {
				var targets = document.querySelectorAll( checkbox.getAttribute( 'data-petfinder-sort-target' ) );
				forEach(targets, function (target) {
					toggleVisibility( target );
				});
			}
		});

		// If checkbox is unchecked, hide matching pets
		forEach(sortAttributes, function (checkbox) {
			if ( checkbox.checked === false ) {
				var targets = document.querySelectorAll( checkbox.getAttribute( 'data-petfinder-sort-target' ) );
				forEach(targets, function (target) {
					toggleVisibility( target, true );
				});
			}
		});

	};

	/**
	 * Show all pets and check all checkboxes
	 * @private
	 */
	var resetPets = function () {

		// Show all pets
		forEach(pets, function (pet) {
			toggleVisibility( pet );
		});

		// Check all breed checkboxes
		forEach(sortBreeds, function (checkbox) {
			checkbox.checked = true;
		});

		// Check all attribute checkboxes
		forEach(sortAttributes, function (checkbox) {
			checkbox.checked = true;
		});

		// Check all toggle checkboxes
		forEach(sortToggles, function (checkbox) {
			checkbox.checked = true;
		});

	};

	/**
	 * Handle click events
	 * @private
	 * @param {Event} event The click event
	 */
	var eventHandler = function (event) {

		// Get clicked object
		var toggle = event.target;
		var checkbox = getClosest(toggle, '[data-petfinder-sort]');

		// If a sort checkbox, sort pets
		if ( checkbox ) {

			// Save checkbox state
			saveCheckedState( checkbox );

			// If a toggle checkbox, toggle all
			if ( checkbox.getAttribute( 'data-petfinder-sort' )  === 'toggle' ) {
				toggleAll( checkbox );
			}

			// Sort pets
			sortPets();

		}

	};

	/**
	 * Destroy the current initialization.
	 * @public
	 */
	petfinderSort.destroy = function () {

		// If plugin isn't already initialized, stop
		if ( !settings ) return;

		// Remove init class for conditional CSS
		document.documentElement.classList.remove( settings.initClass );

		resetPets();

		// Remove event listeners
		document.removeEventListener('click', eventHandler, false);

		// Reset variables
		states = {};
		settings = null;
		eventTimeout = null;
		pets = null;
		sortBreeds = null;
		sortAttributes = null;
		sortToggles = null;
		hideAll = null;

	};

	/**
	 * Initialize Plugin
	 * @public
	 * @param {Object} options User settings
	 */
	petfinderSort.init = function ( options ) {

		// feature test
		if ( !supports ) return;

		// Destroy any existing initializations
		petfinderSort.destroy();

		// Variables
		settings = extend( defaults, options || {} ); // Merge user options with defaults
		pets = document.querySelectorAll('.pf-pet');
		sortBreeds = document.querySelectorAll('[data-petfinder-sort="breeds"]');
		sortAttributes = document.querySelectorAll('[data-petfinder-sort="attributes"]');
		sortToggles = document.querySelectorAll('[data-petfinder-sort="toggle"]');
		hideAll = sortBreeds.length === 0 ? false : true;

		// Add class to HTML element to activate conditional CSS
		document.documentElement.classList.add( settings.initClass );

		// On page load, set checkbox states and run sort
		getCheckedStates();
		sortPets();

		// Listen for click events
		document.addEventListener('click', eventHandler, false);

	};


	//
	// Public APIs
	//

	return petfinderSort;

});