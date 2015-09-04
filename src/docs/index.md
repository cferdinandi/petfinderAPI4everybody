<div id="pf-api-data">
	<p>Your browser does not support the JavaScript APIs required to use this script. Sorry.</p>
</div>

<div data-petfinder-app="aside"></div>
<div data-petfinder-app="main">Enter your developer key and a shelter ID in the box above to get started.</div>

<div data-petfinder-template="all" hidden>
	<div class="{{classes}}">
		<div data-petfinder-img-container>
			<img src="{{photo.1.medium}}">
		</div>
		<h2>{{name}}</h2>
		<p><a data-petfinder-async href="{{url.pet}}">View Full Profile</a></p>
		<hr>
	</div>
</div>

<div data-petfinder-template="one" hidden>
	<p><a data-petfinder-async href="{{url.all}}">&larr; Back to Full List</a></p>
	<div data-petfinder-img-container>
		<div data-petfinder-img></div>
		<p>
			<a data-petfinder-img-toggle="{{photo.1.large}}" href="#"><img src="{{photo.1.thumbnail.large}}"></a>&nbsp;
			<a data-petfinder-img-toggle="{{photo.2.large}}" href="#"><img src="{{photo.2.thumbnail.large}}"></a>&nbsp;
			<a data-petfinder-img-toggle="{{photo.3.large}}" href="#"><img src="{{photo.3.thumbnail.large}}"></a>
		</p>
	</div>
	<h2>{{name}}</h2>
	<p>
		Age: {{age}}<br>
		Gender: {{gender}}<br>
		Size: {{size}}
	</p>
	<div>{{description}}</div>
</div>

<div data-petfinder-template="aside-all" hidden>
	<strong>Age:</strong>
	{{checkbox.ages.toggle}}

	<strong>Size:</strong>
	{{checkbox.sizes}}

	<strong>Gender:</strong>
	{{checkbox.genders}}

	<strong>Breeds:</strong>
	{{checkbox.breeds.toggle}}
</div>