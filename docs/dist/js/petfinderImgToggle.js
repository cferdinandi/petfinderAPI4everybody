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
		define(['buoy'], factory(root, require('buoy')));
	} else if ( typeof exports === 'object' ) {
		module.exports = factory(root);
	} else {
		root.petfinderImgToggle = factory(root, root.buoy);
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
		callbackBefore: function () {},
		callbackAfter: function () {}
	};


	//
	// Methods
	//

	/**
	 * Load an image into the main image container
	 * @private
	 * @param  {Node} toggle Element that triggered the event
	 */
	var toggleImage = function ( toggle ) {

		// Sanity check
		if ( !toggle ) return;

		// Variables
		var container = buoy.getClosest(toggle, '[data-petfinder-img-container]');
		if ( !container ) return;
		var img = container.querySelector( '[data-petfinder-img]' );
		if ( !img ) return;

		// Load image
		img.innerHTML = '<img ' + settings.imgAttributes + ' src="' + toggle.getAttribute( 'data-petfinder-img-toggle' ) + '">';

	};

	/**
	 * Handle events
	 * @private
	 */
	var eventHandler = function (event) {
		var toggle = event.target;
		var closest = buoy.getClosest(toggle, '[data-petfinder-img-toggle]');
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
		settings = buoy.extend( defaults, options || {} ); // Merge user options with defaults
		containers = document.querySelectorAll( '[data-petfinder-img-container]' );

		// Add class to HTML element to activate conditional CSS
		document.documentElement.classList.add( settings.initClass );

		// Toggle first image on page load
		buoy.forEach(containers, function (container) {
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