# petfinderAPI4everybody.js beta [![Build Status](https://travis-ci.org/cferdinandi/petfinderAPI4everybody.svg)](https://travis-ci.org/cferdinandi/petfinderAPI4everybody)
A JavaScript plugin that makes it easy for anyone to use the [Petfinder API](https://www.petfinder.com/developers/api-docs). Currently in Beta.

[Download petfinderAPI4everybody.js](https://github.com/cferdinandi/petfinderAPI4everybody/archive/master.zip) / [View the demo](http://cferdinandi.github.io/petfinderAPI4everybody/)

**In This Documentation**

1. [Getting Started](#getting-started)
2. [Installing with Package Managers](#installing-with-package-managers)
3. [Working with the Source Files](#working-with-the-source-files)
4. [Options & Settings](#options-and-settings)
5. [Browser Compatibility](#browser-compatibility)
6. [Roadmap](#roadmap)
7. [How to Contribute](#how-to-contribute)
8. [License](#license)



## Getting Started

Compiled and production-ready code can be found in the `dist` directory. The `src` directory contains development code. Unit tests are located in the `test` directory. It's the same build system that's used by [Kraken](http://cferdinandi.github.io/kraken/), so it includes some unnecessary tasks but can be dropped right in to the boilerplate without any configuration.

### 1. Include petfinderAPI4everybody.js on your site.

```html
<script src="dist/js/classList.js"></script>
<script src="dist/js/petfinderAPI4everybody.js"></script>
```

petfinderAPI4everybody.js requires [classList.js](https://github.com/eligrey/classList.js), a polyfill that extends ECMAScript 5 API support to more browsers.

### 2. Add the markup to your HTML.

```html
<div data-petfinder-app="main">
	<!-- Required -->
	<!-- Main pet content will be generated here -->
</div>

<div data-petfinder-app="aside">
	<!-- Optional -->
	<!-- Supplemental content will be generated here -->
</div>

<div data-petfinder-template="all" hidden>
	<!-- Required -->
	<!-- Markup for each pet in the "All Pets" view -->
</div>

<div data-petfinder-template="one" hidden>
	<!-- Optional -->
	<!-- Markup for pet in the "One Pet" view -->
</div>

<div data-petfinder-template="aside-all" hidden>
	<!-- Optional -->
	<!-- Markup for the "All Pets" aside section -->
</div>

<div data-petfinder-template="aside-one" hidden>
	<!-- Optional -->
	<!-- Markup for the "One Pet" aside section -->
</div>
```

This script uses two types of elements:

1. `[data-petfinder-app]` elements are containers that markup with data from the Petfinder API will be generated into.
2. `[data-petfinder-template]` elements are templates that tell the script how generate markup and where to place Petfinder API data.

Place the two `[data-petfinder-app]` elements anywhere on a webpage. You can wrap them in other elements, add classes and IDs, and so on.

* `[data-petfinder-app="main"]` - The primary area where all data for specific pets will be displayed.
* `[data-petfinder-app="aside"]` - [optional] Used to display lists, checkboxes, and supplemental information.

Add markup for the `main` and `aside` content areas into the appropriate `[data-petfinder-template]` elements. The script includes variables you can use to dynamically add data from the Petfinder API (see the next section).

* `[data-petfinder-template="all"]` - Template for all pets. Markup looped over each pet.
* `[data-petfinder-template="one"]` - [optional] Template for one pet.
* `[data-petfinder-template="aside-all"]` - [optional] Template for aside content on all pets page.
* `[data-petfinder-template="aside-one"]` - [optional] Template for aside content on one pet page.

**Notes:**

1. You should include a backup link or Petfinder iframe in the `[data-petfinder-app="main"]` element. This will be displayed if the user's browser is not supported by petfinderAPI4everybody.js or the API fails to load.
2. All `[data-petfinder-template]` elements should be hidden in the DOM using the `[hidden]` attribute, a class or ID and CSS, or inline styling.

#### API Data Variables

Include the following variables in your template elements to dynamically add content from the Petfinder API.

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

#### Asynchronous Loading

For better performance, you can load Petfinder API data asynchronously instead of reloading the page. Simply add `[data-petfinder-async]` to any link that points to a pet profile or the full list of pets. The script will take care of the rest.

**Example**

```html
<a data-petfinder-async href="{{url.pet}}">View Full Profile</a>
```

### 3. Initialize petfinderAPI4everybody.js.

```html
<script>
	petfinderAPI4everybody.init({
		key: '123456789',
		shelterID: 'AA11'
	});
</script>
```

In the footer of your page, after the content, initialize petfinderAPI4everybody.js. [A `key` and `sheltherID` are required](https://www.petfinder.com/developers/api-key). And that's it, you're done. Nice work!



## Installing with Package Managers

You can install petfinderAPI4everybody.js with your favorite package manager.

* **NPM:** `npm install cferdinandi/petfinderAPI4everybody`
* **Bower:** `bower install https://github.com/cferdinandi/petfinderAPI4everybody.git`
* **Component:** `component install cferdinandi/petfinderAPI4everybody`



## Working with the Source Files

If you would prefer, you can work with the development code in the `src` directory using the included [Gulp build system](http://gulpjs.com/). This compiles, lints, and minifies code, and runs unit tests. It's the same build system that's used by [Kraken](http://cferdinandi.github.io/kraken/), so it includes some unnecessary tasks and Sass variables but can be dropped right in to the boilerplate without any configuration.

### Dependencies
Make sure these are installed first.

* [Node.js](http://nodejs.org)
* [Ruby Sass](http://sass-lang.com/install)
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
	reverse: false, // If true, sort pet data reverse chronologically

	// Class Hooks
	initClass: 'js-petfinder-api', // Added on initialization
	allClass: 'js-petfinder-api-all-pets', // Added when all pets are displayed
	oneClass: 'js-petfinder-api-one-pet', // Added when one pet is displayed

	// Miscellaneous
	titlePrefix: '{{name}}` - | ', // Prefix to add to document title when displaying one pet ({{name}} is replaced with pet name)
	loading: 'Fetching the latest pet info...', // Loading text and graphics
	noPet: noPet: 'Sorry, but this pet is no longer available. <a data-petfinder-async href="{{url.all}}">View available pets.</a>', // Message when petID in query string does not match an available pet ({{url.all}} is replaced with a URL to full pet list)

	// Lists & Checkboxes
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
	callbackBefore: function () {}, // Callback to run each time pet content is loaded
	callbackAfter: function () {} // Callback to run after each time pet content is generated
});
```

### Filtering Pets

If you have a lot of pets, you may want to give users the option of filter by attributes like animal type, breed, age, and more. The included (but optional) `petfinderSort.js` script makes this really easy.

1. Include the script on your site.

	```html
	<script src="dist/js/petfinderSort.js"></script>
	```

2. Add any of the attribute checklists you want to use to your template files, and add the `{{classes}}` variable on a containing `<div>` for the pet.

	```html
	<div data-petfinder-template="aside">
		<strong>Breeds</strong>
		{{checklist.breeds}}
		<strong>Sizes</strong>
		{{checklist.sizes}}
	</div>
	<div class="{{classes}}">
		<h2>{{name}}</h2>
		<a href="{{url.pet}}">Full Profile</a>
	</div>
	```

3. Initialize `petfinderSort.js` as a callback after content is generated.

	```js
	petfinderAPI4everybody.init({
		key: '123456789',
		shelterID: 'AA11',
		callbackAfter: function () { petfinderSort.init(); }
	});
	```

### Toggling Images

You may wish to display a main photo for each pet and let users toggle between a few thumbnails. The included (but optional) `petfinderImgToggle.js` makes this easy to do.

1. Include the script on your site.

	```html
	<script src="dist/js/petfinderImgToggle.js"></script>
	```

2. Add your markup. You can add additional DOM elements, classes, IDs, and any other attributes you like, as long as the hierarchy is preserved.

	```html
	<div data-petfinder-img-container>
		<div data-petfinder-img><!-- The image will be loaded here --></div>
		<div>
			<a data-petfinder-img-toggle="{{photo.1.large}}" href="#"><img src="{{photo.1.thumbnail.large}}"></a>
			<a data-petfinder-img-toggle="{{photo.2.large}}" href="#"><img src="{{photo.2.thumbnail.large}}"></a>
			<a data-petfinder-img-toggle="{{photo.3.large}}" href="#"><img src="{{photo.3.thumbnail.large}}"></a>
		</div>
	</div>
	```

	Add the `[data-petfinder-img-toggle]` attribute to any link that you would like to toggle an image, and set it's value to the image URL. Add the `[data-petfinder-img]` attribute to the element that will contain the full-sized image. Give the parent container a `[data-petfinder-img-container]` attribute.

3. Initialize `petfinderImgToggle.js` as a callback after content is generated.

	```js
	petfinderAPI4everybody.init({
		key: '123456789',
		shelterID: 'AA11',
		callbackAfter: function () { petfinderImgToggle.init(); }
	});
	```

	You can also pass in attributes to get applied to the image:

	```js
	petfinderImgToggle.init({
		imgAttributes: 'class="img-photo" data-some-value'
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



## Roadmap

* Add support for pagination.
* Update `petfinderSort.js` for better performance.
* Add script to toggle images in a profile.



## How to Contribute

In lieu of a formal style guide, take care to maintain the existing coding style. Please apply fixes to both the development and production code. Don't forget to update the version number, and when applicable, the documentation.



## License

petfinderAPI4everybody.js is licensed under the [MIT License](http://gomakethings.com/mit/).