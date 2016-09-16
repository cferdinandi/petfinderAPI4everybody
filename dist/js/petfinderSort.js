/*!
 * petfinderAPI4everybody v4.0.1: A JavaScript plugin that makes it easy for anyone to use the Petfinder API
 * (c) 2016 Chris Ferdinandi
 * MIT License
 * http://github.com/cferdinandi/petfinderAPI4everybody
 */

(function (root, factory) {
	if ( typeof define === 'function' && define.amd ) {
		define([], factory(root));
	} else if ( typeof exports === 'object' ) {
		module.exports = factory(root);
	} else {
		root.petfinderSort = factory(root);
	}
})(typeof global !== 'undefined' ? global : this.window || this.global, function (root) {

	'use strict';

	//
	// Variables
	//

	var petfinderSort = {}; // Object for public APIs
	var supports = 'querySelector' in document && 'addEventListener' in root && 'classList' in document.createElement('_'); // Feature test
	var sessionID = 'petfinderSortStates'; // sessionStorage ID
	var settings, eventTimeout, states, pets, sortBreeds, sortAttributes, sortToggles, hideAll;

	// Default settings
	var defaults = {
		initClass: 'js-petfinder-sort',
		callback: function () {}
	};


	//
	// Methods
	//

	/**
	 * A simple forEach() implementation for Arrays, Objects and NodeLists.
	 * @private
	 * @author Todd Motto
	 * @link   https://github.com/toddmotto/foreach
	 * @param {Array|Object|NodeList} collection Collection of items to iterate
	 * @param {Function}              callback   Callback function for each iteration
	 * @param {Array|Object|NodeList} scope      Object/NodeList/Array that forEach is iterating over (aka `this`)
	 */
	var forEach = function ( collection, callback, scope ) {
		if ( Object.prototype.toString.call( collection ) === '[object Object]' ) {
			for ( var prop in collection ) {
				if ( Object.prototype.hasOwnProperty.call( collection, prop ) ) {
					callback.call( scope, collection[prop], prop, collection );
				}
			}
		} else {
			for ( var i = 0, len = collection.length; i < len; i++ ) {
				callback.call( scope, collection[i], i, collection );
			}
		}
	};

	/**
	 * Merge two or more objects. Returns a new object.
	 * @private
	 * @param {Boolean}  deep     If true, do a deep (or recursive) merge [optional]
	 * @param {Object}   objects  The objects to merge together
	 * @returns {Object}          Merged values of defaults and options
	 */
	var extend = function () {

		// Variables
		var extended = {};
		var deep = false;
		var i = 0;
		var length = arguments.length;

		// Check if a deep merge
		if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
			deep = arguments[0];
			i++;
		}

		// Merge the object into the extended object
		var merge = function (obj) {
			for ( var prop in obj ) {
				if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
					// If deep merge and property is an object, merge properties
					if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
						extended[prop] = extend( true, extended[prop], obj[prop] );
					} else {
						extended[prop] = obj[prop];
					}
				}
			}
		};

		// Loop through each object and conduct a merge
		for ( ; i < length; i++ ) {
			var obj = arguments[i];
			merge(obj);
		}

		return extended;

	};

	/**
	 * Get the closest matching element up the DOM tree.
	 * @private
	 * @param  {Element} elem     Starting element
	 * @param  {String}  selector Selector to match against (class, ID, data attribute, or tag)
	 * @return {Boolean|Element}  Returns null if not match found
	 */
	var getClosest = function ( elem, selector ) {

		// Variables
		var firstChar = selector.charAt(0);
		var attribute, value;

		// If selector is a data attribute, split attribute from value
		if ( firstChar === '[' ) {
			selector = selector.substr(1, selector.length - 2);
			attribute = selector.split( '=' );

			if ( attribute.length > 1 ) {
				value = true;
				attribute[1] = attribute[1].replace( /"/g, '' ).replace( /'/g, '' );
			}
		}

		// Get closest match
		for ( ; elem && elem !== document; elem = elem.parentNode ) {

			// If selector is a class
			if ( firstChar === '.' ) {
				if ( elem.classList.contains( selector.substr(1) ) ) {
					return elem;
				}
			}

			// If selector is an ID
			if ( firstChar === '#' ) {
				if ( elem.id === selector.substr(1) ) {
					return elem;
				}
			}

			// If selector is a data attribute
			if ( firstChar === '[' ) {
				if ( elem.hasAttribute( attribute[0] ) ) {
					if ( value ) {
						if ( elem.getAttribute( attribute[0] ) === attribute[1] ) {
							return elem;
						}
					} else {
						return elem;
					}
				}
			}

			// If selector is a tag
			if ( elem.tagName.toLowerCase() === selector ) {
				return elem;
			}

		}

		return null;

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
			settings.callback( checkbox ); // Callback
			return;
		}

		// If checkbox is checked, remove state from sessionStorage
		delete states[name];
		sessionStorage.setItem( sessionID, JSON.stringify(states) );
		settings.callback( checkbox ); // Callback

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

		// If checkbox is in sessionStorage, update it's state
		if ( states && states[name] && states[name] === 'unchecked' ) {
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
		states = null;
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
		settings = extend( true, defaults, options || {} ); // Merge user options with defaults
		pets = document.querySelectorAll( '.pf-pet' );
		sortBreeds = document.querySelectorAll( '[data-petfinder-sort="breeds"]' );
		sortAttributes = document.querySelectorAll( '[data-petfinder-sort="attributes"]' );
		sortToggles = document.querySelectorAll( '[data-petfinder-sort="toggle"]' );
		hideAll = sortBreeds.length === 0 ? false : true;
		if ( root.sessionStorage ) {
			states = sessionStorage.getItem( sessionID ) ? JSON.parse( sessionStorage.getItem( sessionID ) ) : {};
		}
		states = root.sessionStorage ? JSON.parse( sessionStorage.getItem( sessionID ) ) || {} : {};

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