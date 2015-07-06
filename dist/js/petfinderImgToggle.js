/**
 * petfinderAPI4everybody v2.0.0
 * A JavaScript plugin that makes it easy for anyone to use the Petfinder API, by Chris Ferdinandi.
 * http://github.com/cferdinandi/petfinderAPI4everybody
 * 
 * Free to use under the MIT License.
 * http://gomakethings.com/mit/
 */

(function (root, factory) {
	if ( typeof define === 'function' && define.amd ) {
		define([], factory(root));
	} else if ( typeof exports === 'object' ) {
		module.exports = factory(root);
	} else {
		root.petfinderImgToggle = factory(root);
	}
})(typeof global !== 'undefined' ? global : this.window || this.global, function (root) {

	'use strict';

	//
	// Variables
	//

	var petfinderImgToggle = {}; // Object for public APIs
	var supports = !!document.querySelector && !!root.addEventListener; // Feature test
	var settings, eventTimeout, containers;

	// Default settings
	var defaults = {
		initClass: 'js-petfinder-img-toggle',
		imgAttributes: '',
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
		var supports = 'classList' in document.documentElement;
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
				if ( supports ) {
					if ( elem.classList.contains( selector.substr(1) ) ) {
						return elem;
					}
				} else {
					if ( new RegExp('(^|\\s)' + selector.substr(1) + '(\\s|$)').test( elem.className ) ) {
						return elem;
					}
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
	 * Load an image into the main image container
	 * @private
	 * @param  {Node} toggle Element that triggered the event
	 */
	var toggleImage = function ( toggle ) {

		// Sanity check
		if ( !toggle ) return;

		// Variables
		var container = getClosest(toggle, '[data-petfinder-img-container]');
		if ( !container ) return;
		var img = container.querySelector( '[data-petfinder-img]' );
		if ( !img ) return;

		// Load image
		img.innerHTML = '<img ' + settings.imgAttributes + ' src="' + toggle.getAttribute( 'data-petfinder-img-toggle' ) + '">';

		// Run callback
		settings.callback();

	};

	/**
	 * Handle events
	 * @private
	 */
	var eventHandler = function (event) {
		var toggle = event.target;
		var closest = getClosest(toggle, '[data-petfinder-img-toggle]');
		if ( closest ) {
			event.preventDefault();
			toggleImage( closest );
		}
	};

	/**
	 * Destroy the current initialization.
	 * @public
	 */
	petfinderImgToggle.destroy = function () {

		// If plugin isn't already initialized, stop
		if ( !settings ) return;

		// Remove init class for conditional CSS
		document.documentElement.classList.remove( settings.initClass );

		// Remove event listeners
		document.removeEventListener('click', eventHandler, false);

		// Reset variables
		settings = null;
		eventTimeout = null;
		containers = null;

	};

	/**
	 * Initialize Plugin
	 * @public
	 * @param {Object} options User settings
	 */
	petfinderImgToggle.init = function ( options ) {

		// feature test
		if ( !supports ) return;

		// Destroy any existing initializations
		petfinderImgToggle.destroy();

		// Variables
		settings = extend( defaults, options || {} ); // Merge user options with defaults
		containers = document.querySelectorAll( '[data-petfinder-img-container]' );

		// Add class to HTML element to activate conditional CSS
		document.documentElement.classList.add( settings.initClass );

		// Toggle first image on page load
		forEach(containers, function (container) {
			toggleImage( container.querySelector( '[data-petfinder-img-toggle]' ) );
		});

		// Listen for events
		document.addEventListener('click', eventHandler, false);

	};


	//
	// Public APIs
	//

	return petfinderImgToggle;

});