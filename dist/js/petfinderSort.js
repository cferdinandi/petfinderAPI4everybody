/**
 * petfinderAPI4everybody v1.0.0
 * A JavaScript plugin that makes it easy for anyone to use the Petfinder API, by Chris Ferdinandi.
 * http://github.com/cferdinandi/petfinderAPI4everybody
 * 
 * Free to use under the MIT License.
 * http://gomakethings.com/mit/
 */

(function (root, factory) {
	if ( typeof define === 'function' && define.amd ) {
		define(['buoy'], factory(root));
	} else if ( typeof exports === 'object' ) {
		module.exports = factory(root, require('buoy'));
	} else {
		root.petfinderSort = factory(root, root.buoy);
	}
})(typeof global !== 'undefined' ? global : this.window || this.global, function (root) {

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
		buoy.forEach(sortBreeds, function (checkbox) { setCheckedState( checkbox ); });
		buoy.forEach(sortAttributes, function (checkbox) { setCheckedState( checkbox ); });
		buoy.forEach(sortToggles, function (checkbox) { setCheckedState( checkbox ); });
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
			buoy.forEach(targets, function (target) {
				target.checked = true;
				saveCheckedState( target );
			});
			return;
		}

		// If checkbox is unchecked, unselect all checkboxes
		buoy.forEach(targets, function (target) {
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
		buoy.forEach(pets, function (pet) {

			// If breed sorting is available, hide all pets by default
			if ( hideAll ) {
				toggleVisibility( pet, true );
				return;
			}

			// Otherwise, show all pets by default
			toggleVisibility( pet );

		});

		// If breed is checked, show matching pets
		buoy.forEach(sortBreeds, function (checkbox) {
			if ( checkbox.checked === true ) {
				var targets = document.querySelectorAll( checkbox.getAttribute( 'data-petfinder-sort-target' ) );
				buoy.forEach(targets, function (target) {
					toggleVisibility( target );
				});
			}
		});

		// If checkbox is unchecked, hide matching pets
		buoy.forEach(sortAttributes, function (checkbox) {
			if ( checkbox.checked === false ) {
				var targets = document.querySelectorAll( checkbox.getAttribute( 'data-petfinder-sort-target' ) );
				buoy.forEach(targets, function (target) {
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
		buoy.forEach(pets, function (pet) {
			toggleVisibility( pet );
		});

		// Check all breed checkboxes
		buoy.forEach(sortBreeds, function (checkbox) {
			checkbox.checked = true;
		});

		// Check all attribute checkboxes
		buoy.forEach(sortAttributes, function (checkbox) {
			checkbox.checked = true;
		});

		// Check all toggle checkboxes
		buoy.forEach(sortToggles, function (checkbox) {
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
		var checkbox = buoy.getClosest(toggle, '[data-petfinder-sort]');

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
		settings = buoy.extend( defaults, options || {} ); // Merge user options with defaults
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