/**
 * petfinderAPI4everybody v0.3.1
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

	var publicAPI = {}; // Object for public APIs
	var supports = !!document.querySelector && !!root.addEventListener && !!root.localStorage; // Feature test

	// Default settings
	var defaults = {
		someVar: 123,
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
	 * Setup save filter settings
	 * @param  {Element} filter Checkbox element
	 */
	var petfinderSortSave = function (filter) {
		if ( window.sessionStorage ) {
			var name = filter.getAttribute('data-target');
			if ( filter.checked === false ) {
				sessionStorage.setItem(name, 'unchecked');
			} else {
				sessionStorage.removeItem(name);
			}
		}
	};

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
	 * Setup show/hide filter
	 */
	var petfinderSort = function (pets, petFilterBreeds, petFilterOthers) {
		forEach(pets, function (pet) {
			console.log(pet);
			toggleVisibility( pet, true );
		});
		forEach(petFilterBreeds, function (filter) {
			var sortTargetValue = filter.getAttribute('data-target');
			var sortTargets = document.querySelectorAll(sortTargetValue);
			if ( filter.checked === true ) {
				forEach(sortTargets, function (target) {
					toggleVisibility( target );
				});
			}
		});
		forEach(petFilterOthers, function (filter) {
			var sortTargetValue = filter.getAttribute('data-target');
			var sortTargets = document.querySelectorAll(sortTargetValue);
			if ( filter.checked === false ) {
				forEach(sortTargets, function (target) {
					toggleVisibility( target, true );
				});
			}
		});
	};

	/**
	 * Get sort settings from localStorage
	 * @param  {Element} filter Checkbox to get data for
	 */
	var petfinderSortGet = function (filter) {
		if ( window.sessionStorage ) {
			var name = filter.getAttribute('data-target');
			var status = sessionStorage.getItem(name);
			if ( status === 'unchecked' ) {
				filter.checked = false;
			}
		}
	};

	/**
	 * Destroy the current initialization.
	 * @public
	 * @todo
	 */
	publicAPI.destroy = function () {
		// @todo Undo init...
	};

	/**
	 * Initialize Plugin
	 * @public
	 * @param {Object} options User settings
	 */
	publicAPI.init = function ( options ) {

		// feature test
		if ( !supports ) return;

		// Variables
		var pets = document.querySelectorAll('.pf-pet');
		var petFilterBreeds = document.querySelectorAll('.pf-breeds');
		var petFilterOthers = document.querySelectorAll('.pf-sort');
		var petFilterToggleAll = document.querySelectorAll('.pf-toggle-all');

		// Toggle check/uncheck all
		forEach(petFilterToggleAll, function (filter) {
			filter.addEventListener('change', function(e) {
				var sortTargetValue = filter.getAttribute('data-target');
				var sortTargets = document.querySelectorAll(sortTargetValue);
				if ( filter.checked === true ) {
					forEach(sortTargets, function (target) {
						target.checked = true;
						petfinderSortSave(target);
					});
				} else {
					forEach(sortTargets, function (target) {
						target.checked = false;
						petfinderSortSave(target);
					});
				}
				petfinderSortSave(filter);
				petfinderSort(pets, petFilterBreeds, petFilterOthers);
			}, false);
		});


		// Run sort when filter is changed
		forEach(petFilterBreeds, function (filter) {
			filter.addEventListener('change', function(e) {
				petfinderSort(pets, petFilterBreeds, petFilterOthers);
				petfinderSortSave(filter);
			}, false);
		});

		forEach(petFilterOthers, function (filter) {
			filter.addEventListener('change', function(e) {
				petfinderSort(pets, petFilterBreeds, petFilterOthers);
				petfinderSortSave(filter);
			}, false);
		});


		// Load filter settings on page load
		forEach(petFilterBreeds, function (filter) {
			petfinderSortGet(filter);
		});
		forEach(petFilterOthers, function (filter) {
			petfinderSortGet(filter);
		});
		forEach(petFilterToggleAll, function (filter) {
			petfinderSortGet(filter);
		});
		petfinderSort(pets, petFilterBreeds, petFilterOthers);

	};


	//
	// Public APIs
	//

	return publicAPI;

});