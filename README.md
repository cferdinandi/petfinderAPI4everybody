# petfinderAPI4everybody.js [![Build Status](https://travis-ci.org/cferdinandi/petfinderAPI4everybody.svg)](https://travis-ci.org/cferdinandi/petfinderAPI4everybody)
A JavaScript plugin that makes it easier for developers to use the [Petfinder API](https://www.petfinder.com/developers/api-docs).

[Download petfinderAPI4everybody.js](https://github.com/cferdinandi/petfinderAPI4everybody/archive/master.zip) / [View the demo](http://cferdinandi.github.io/petfinderAPI4everybody/)

***Note:*** *This is DIY library for web developers. If you're not comfortable writing code, you may prefer working with [Fetch](https://fetch.gomakethings.com/), my plug-and-play solution for the Petfinder API.*



## Getting Started

Compiled and production-ready code can be found in the `dist` directory. The `src` directory contains development code.

### 1. Include petfinderAPI4everybody.js on your site.

```html
<script src="dist/js/petfinderAPI4everybody.js"></script>
```

### 2. Add the markup to your HTML.

```html
<div data-petfinder="main">
	<!-- Required -->
	<!-- Main pet content will be generated here -->
	<a href="http://awos.petfinder.com/shelters/AA11.html">View our adoptable pets on Petfinder.</a>
</div>

<div data-petfinder="aside">
	<!-- Optional -->
	<!-- Supplemental content will be generated here -->
</div>
```

Place the two `[data-petfinder]` elements anywhere on a webpage. You can wrap them in other elements, add classes and IDs, and so on.

- `[data-petfinder="main"]` - The primary area where all data for specific pets will be displayed.
- `[data-petfinder="aside"]` - [optional] Used to display lists, checkboxes, and supplemental information.

***Note:*** *You should include a backup link or Petfinder iframe in the `[data-petfinder="main"]` element. This will be displayed if the user's browser is not supported by petfinderAPI4everybody.js or the API fails to load.*

### 3. Initialize petfinderAPI4everybody.js.

In the footer of your page, after the content, initialize petfinderAPI4everybody.js.

[A `key` and `sheltherID` are required](https://www.petfinder.com/developers/api-key). This is also where you pass in templates for the `main` and `aside` content.

And that's it, you're done. Nice work!

***Note:*** *If you find this section confused, [check out the template](#template) to see an example of how you might set things up. Still lost? [I can help.](#help-with-this-plugin)*

```html
<script>
	petfinderAPI4everybody.init({
		key: '123456789', // Your API key with Petfinder
		shelterID: 'AA11', // Your Petfinder shelter ID
		templates: {
			// The layout for the page that displays all pets
			allPets:
				'<div>' +
					'<div>' +
						'<img src="{{photo.1.medium}}">' +
					'</div>' +
					'<h2>{{name}}</h2>' +
					'<p><a href="{{url.pet}}">View Full Profile</a></p>' +
					'<hr>' +
				'</div>',
			onePet: null, // The layout for individual pet profiles [optional]
			asideAllPets: null, // The layout for secondary content on the "All Pets" page [optional]
			asideOnePet: null, // The layout for secondary content on individual pet pages [optional]
		}
	});
</script>
```

#### API Data Variables

Include the following variables in your template markup to dynamically add content from the Petfinder API.

**Pet Variables:**

* `{{name}}` - Name of the pet
* `{{id}}` - Petfinder ID for the pet
* `{{description}}` - Description of the pet
* `{{age}}` - Age of the pet
* `{{gender}}` - Gender of the pet
* `{{size}}` - Size of the pet
* `{{animal}}` - Type of animal the pet is
* `{{breeds}}` - Breeds of the pet
* `{{photo.1.large}}` - First photo of the pet, large
* `{{photo.2.large}}` - Second photo of the pet, large
* `{{photo.3.large}}` - Third photo of the pet, large
* `{{photo.1.medium}}` - First photo of the pet, medium
* `{{photo.2.medium}}` - Second photo of the pet, medium
* `{{photo.3.medium}}` - Third photo of the pet, medium
* `{{photo.1.thumbnail.small}}` - First photo of the pet, small thumbnail
* `{{photo.2.thumbnail.small}}` - Second photo of the pet, small thumbnail
* `{{photo.3.thumbnail.small}}` - Third photo of the pet, small thumbnail
* `{{photo.1.thumbnail.medium}}` - First photo of the pet, medium thumbnail
* `{{photo.2.thumbnail.medium}}` - Second photo of the pet, medium thumbnail
* `{{photo.3.thumbnail.medium}}` - Third photo of the pet, medium thumbnail
* `{{photo.1.thumbnail.large}}` - First photo of the pet, large thumbnail
* `{{photo.2.thumbnail.large}}` - Second photo of the pet, large thumbnail
* `{{photo.3.thumbnail.large}}` - Third photo of the pet, large thumbnail
* `{{options.specialNeeds}}` - Text if the pet has special needs
* `{{options.noDogs}}` - Text if the pet can't be in a home with dogs
* `{{options.noCats}}` - Text if the pet can't be in a home with cats
* `{{options.noKids}}` - Text if the pet can't be in a home with kids
* `{{options.noClaws}}` - Text if the pet doesn't have claws
* `{{options.hasShots}}` - Text if the pet is up-to-date with shots
* `{{options.housebroken}}` - Text if the pet is housebroken
* `{{options.altered}}` - Text if the pet is spayed or neutered
* `{{options.multi}}` - Text if pet can't be in a home with some combination dogs, cats, or kids
* `{{contact.name}}` - Name of contact for pet
* `{{contact.email}}` - Email of contact for pet
* `{{contact.phone}}` - Phone number of contact for pet
* `{{contact.address1}}` - Address (line one) of contact for pet
* `{{contact.address2}}` - Address (line two) of contact for pet
* `{{contact.city}}` - City of contact for pet
* `{{contact.state}}` - State of contact for pet
* `{{contact.zip}}` - Zip code of contact for pet
* `{{contact.fax}}` - Fax number of contact for pet
* `{{url.all}}` - URL to list of all pets (for use in "one pet" template).
* `{{url.pet}}` - URL to profile of individual pet (for use in "all pets" template)
* `{{url.petfinder}}` - URL to pet's Petfinder profile
* `{{classes}}` - A string of classes describing all pet attributes
* `{{number}}` - This pets number out of the total number of available pets (for use in "one pet" template - eg. 10 of 25)
* `{{total}}` - Total number of pets available

**Aside Variables:**

* `{{list.ages}}` - List of available ages
* `{{list.animals}}` - List of available animals
* `{{list.breeds}}` - List of available pet breeds
* `{{list.options}}` - List of available options
* `{{list.genders}}` - List of available genders
* `{{list.sizes}}` - List of available sizes
* `{{checkbox.ages}}` - Checkbox and label for each available age
* `{{checkbox.animals}}` - Checkbox and label for each available animal
* `{{checkbox.breeds}}` - Checkbox and label for each available breed
* `{{checkbox.options}}` - Checkbox and label for each available option
* `{{checkbox.genders}}` - Checkbox and label for each available gender
* `{{checkbox.sizes}}` - Checkbox and label for each available size
* `{{checkbox.ages.toggle}}` - Checkbox and label for each available age with "select all" toggle
* `{{checkbox.animals.toggle}}` - Checkbox and label for each available animal with "select all" toggle
* `{{checkbox.breeds.toggle}}` - Checkbox and label for each available breed with "select all" toggle
* `{{checkbox.options.toggle}}` - Checkbox and label for each available option with "select all" toggle
* `{{checkbox.genders.toggle}}` - Checkbox and label for each available gender with "select all" toggle
* `{{checkbox.sizes.toggle}}` - Checkbox and label for each available size with "select all" toggle
* `{{total}}` - Total number of pets available

***Note:*** *Lists return `<li>` elements only. You must place them inside an `<ol>` or `<ul>` element as desired. Example: `<ul>{{list.breeds}}</ul>`*


## Filtering Pets

If you have a lot of pets, you may want to give users the option of filter by attributes like animal type, breed, age, and more. The included (but optional) `petfinderSort.js` script makes this really easy.

### 1. Include the script on your site.

```html
<script src="dist/js/petfinderSort.js"></script>
```

### 2. Add the markup to your HTML and initialize petfinderSort.js as a callback after the content is generated.

Add any of the attribute checklists you want to use to your template, and add the `{{classes}}` variable on a containing `<div>` in the `allPets` template. Initialize petfinderSort.js as a callback after content is generated.

<script>
	petfinderAPI4everybody.init({
		...
		templates: {
			allPets:
				'<div class="{{classes}}">' +
					// Pet layout
				'</div>',
			asideAllPets:
				'<strong>Age:</strong>' +
				'{{checkbox.ages.toggle}}' +
				'<br><br>' +

				'<strong>Size:</strong>' +
				'{{checkbox.sizes}}' +
				'<br><br>' +

				'<strong>Gender:</strong>' +
				'{{checkbox.genders}}' +
				'<br><br>' +

				'<strong>Breeds:</strong>' +
				'{{checkbox.breeds.toggle}}',
			callback: function () {
				petfinderSort.init();
			}
		}
	});
</script>



## Template

If the initial setup is a bit confusing, here's a template to get you started.

```html
<!-- Container that "aside" content will be added to -->
<div data-petfinder="aside"></div>

<!-- Container that "main" content will be added to. The text in here will be replaced when the script loads. -->
<div data-petfinder="main">
	<a href="http://awos.petfinder.com/shelters/AA11.html">View our adoptable pets on Petfinder.</a>
</div>

<script src="dist/js/petfinderAPI4everybody.js"></script>
<script>
	;(function (window, document, undefined) {

		'use strict';

		// Templates

		var allPets =
			'<div class="{{classes}}">' +
				'<div>' +
					'<img src="{{photo.1.medium}}">' +
				'</div>' +
				'<h2>{{name}}</h2>' +
				'<p><a href="{{url.pet}}">View Full Profile</a></p>' +
				'<hr>' +
			'</div>';

		var onePet =
			'<p><a href="{{url.all}}">&larr; Back to Full List</a></p>' +
			'<p>' +
				'<a target="_blank" href="{{photo.1.large}}"><img src="{{photo.1.thumbnail.large}}"></a>&nbsp;' +
				'<a target="_blank" href="{{photo.1.large}}"><img src="{{photo.2.thumbnail.large}}"></a>&nbsp;' +
				'<a target="_blank" href="{{photo.1.large}}"><img src="{{photo.3.thumbnail.large}}"></a>' +
			'</p>' +
			'<h2>{{name}}</h2>' +
			'<p>' +
				'Age: {{age}}<br>' +
				'Gender: {{gender}}<br>' +
				'Size: {{size}}' +
			'</p>' +
			'<p>{{options.multi}}</p>' +
			'<div>{{description}}</div>';

		var asideAllPets =
			'<strong>Age:</strong>' +
			'{{checkbox.ages.toggle}}' +
			'<br><br>' +

			'<strong>Size:</strong>' +
			'{{checkbox.sizes}}' +
			'<br><br>' +

			'<strong>Gender:</strong>' +
			'{{checkbox.genders}}' +
			'<br><br>' +

			'<strong>Breeds:</strong>' +
			'{{checkbox.breeds.toggle}}';

		petfinderAPI.init({
			key: '[YOUR PETFINDER API KEY HERE]', // Learn more: https://www.petfinder.com/developers/api-key
			shelter: '[YOUR SHELTER ID]',
			templates: {
				allPets: allPets,
				onePet: onePet,
				asideAllPets: asideAllPets,
			},
			callback: function () {
				petfinderSort.init(); // If you want to use the filtering plugin
			}
		});

	})(window, document);
</script>
```



## Installing with Package Managers

You can install petfinderAPI4everybody.js with your favorite package manager.

* **NPM:** `npm install cferdinandi/petfinderAPI4everybody`
* **Bower:** `bower install https://github.com/cferdinandi/petfinderAPI4everybody.git`
* **Component:** `component install cferdinandi/petfinderAPI4everybody`



## Working with the Source Files

If you would prefer, you can work with the development code in the `src` directory using the included [Gulp build system](http://gulpjs.com/). This compiles, lints, and minifies code.

### Dependencies
Make sure these are installed first.

* [Node.js](http://nodejs.org)
* [Gulp](http://gulpjs.com) `sudo npm install -g gulp`

### Quick Start

1. In bash/terminal/command line, `cd` into your project directory.
2. Run `npm install` to install required files.
3. When it's done installing, run one of the task runners to get going:
	* `gulp` manually compiles files.
	* `gulp watch` automatically compiles files and applies changes using [LiveReload](http://livereload.com/).



## Options and Settings

petfinderAPI4everybody.js includes smart defaults and works right out of the box. But if you want to customize things, it also has a robust API that provides multiple ways for you to adjust the default options and settings.

### Global Settings

You can pass options and callbacks into petfinderAPI4everybody.js through the `init()` function:

```javascript
petfinderAPI4everybody.init({

	// API Defaults
	key: null, // Your API developer key
	shelter: null, // The ID of the shelther you want to get data for
	count: 25, // Number of pets to get data for
	status: 'A', // Adoption status of pets (A = adoptable)
	offset: null, // Skip first x number of pets when retrieving data
	expiration: 60, // How long to save API data for locally, in minutes
	newestFirst: true, // If true, show newest pets first on page

	// Selectors (must be valid CSS selectors)
	selectorAppMain: '[data-petfinder="main"]', // Main content area
	selectorAppAside: '[data-petfinder="aside"]', // Secondary content area

	// Templates
	templates: {
		allPets: null, // Template for page that displays all pets
		onePet: null, // Tempplate for individual pet profiles
		asideAllPets: null, // Template for secondary content on all pets page
		asideOnePet: null, // Template for secondary content on individual pet profiles
	},

	// Class Hooks
	initClass: 'js-petfinder-api', // Added on initialization
	allClass: 'js-petfinder-api-all-pets', // Added when all pets are displayed
	oneClass: 'js-petfinder-api-one-pet', // Added when one pet is displayed

	// Miscellaneous
	titlePrefix: '{{name}}` - | ', // Prefix to add to document title when displaying one pet ({{name}} is replaced with pet name)
	loading: 'Fetching the latest pet info...', // Loading text and graphics
	noPet: noPet: 'Sorry, but this pet is no longer available. <a data-petfinder-async href="{{url.all}}">View available pets.</a>', // Message when petID in query string does not match an available pet ({{url.all}} is replaced with a URL to full pet list)

	// Lists and Checkboxes
	classPrefix: 'pf-', // Prefix to add before all pet classes
	toggleAll: 'Select/Unselect All', // Select/Unselect All checkbox text

	// Pet photos
	noImage: '', // Placeholder image to use when no photo is available

	// Breeds Text
	breedDelimiter: ', ', // Character(s) to use to separate multiple breeds

	// Animal Text
	animalUnknown: '', // Text when animal type is unknown

	// Size Text
	sizeUnknown: 'Not Known', // Text when pet size is unknown
	sizeS: 'Small', // Text for small pets
	sizeM: 'Medium', // Text for medium pets
	sizeL: 'Large', // Text for large pets
	sizeXL: 'Extra Large', // Text for extra large pets

	// Age Text
	ageUnknown: 'Not Known', // Text when pet age is unknown
	ageBaby: 'Baby', // Text for baby pets
	ageYoung: 'Young', // Text for young pets
	ageAdult: 'Adult', // Text for adult pets
	ageSenior: 'Senior', // Text for senior pets

	// Gender Text
	genderUnknown: 'Not Known', // Text when pet gender is unknown
	genderM: 'Male', // Text when pet is a male
	genderF: 'Female', // Text when pet is a female

	// Options Text
	optionsSpecialNeeds: 'Special Needs', // Text for pets with special needs
	optionsNoDogs: 'No Dogs', // Text for pets that can't be in a house with dogs
	optionsNoCats: 'No Cats', // Text for pets that can't be in a house with cats
	optionsNoKids: 'No Kids', // Text for pets that can't be in a house with kids
	optionsNoClaws: 'No Claws', // Text for pets without claws
	optionsHasShot: 'Has hots', // Text for pets that are up-to-date with shots
	optionsHousebroken: 'Housebroken', // Text for housebroken pets
	optionsAltered: 'Spayed/Neutered', // Text for spayed or neutered pets

	// Multi-Option Text
	optionsNoDogsCatsKids: 'No Dogs/Cats/Kids', // Text for pets that can't be in a house with dogs, cats, or kids
	optionsNoDogsCats: 'No Dogs/Cats', // Text for pets that can't be in a house with dogs or cats
	optionsNoDogsKids: 'No Dogs/Kids', // Text for pets that can't be in a house with dogs or kids
	optionsNoCatsKids: 'No Cats/Kids', // Text for pets that can't be in a house with cats or kids

	// Contact Info Missing Text
	contactName: '', // Text when pet's contact name is missing
	contactEmail: '', // Text when pet's contact email is missing
	contactPhone: '', // Text when pet's contact phone number is missing
	contactAddress1: '', // Text when pet's contact first line address is missing
	contactAddress2: '', // Text when pet's contact second line address is missing
	contactCity: '', // Text when pet's contact city is missing
	contactState: '', // Text when pet's contact state is missing
	contactZip: '', // Text when pet's contact zip code is missing
	contactFax: '', // Text when pet's contact fax number is missing

	// Callbacks
	callback: function () {} // Callback to run after each time pet content is generated
});
```

### Use petfinderAPI4everybody.js events in your own scripts

You can also call petfinderAPI4everybody.js events in your own scripts.

#### destroy()
Destroy the current `petfinderAPI4everybody.init()`. This is called automatically during the init function to remove any existing initializations.

```javascript
petfinderAPI4everybody.destroy();
```



## Browser Compatibility

petfinderAPI4everybody.js works in all modern browsers, and IE 9 and above.

petfinderAPI4everybody.js is built with modern JavaScript APIs. If the JavaScript file fails to load, or if your site is viewed on older and less capable browsers, no API content will be displayed. You should always include fallback content in the `[data-petfinder-app="main"]` element.



## How to Contribute

In lieu of a formal style guide, take care to maintain the existing coding style. Please apply fixes to both the development and production code. Don't forget to update the version number, and when applicable, the documentation.



## License

The code is available under the [MIT License](LICENSE.md).