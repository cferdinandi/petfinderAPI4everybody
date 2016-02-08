<div id="pf-api-data">
	<p>Your browser does not support the JavaScript APIs required to use this script. Sorry.</p>
</div>

<div class="row">
	<div class="grid-third">
		<div data-petfinder-app="aside"></div>
	</div>
	<div class="grid-two-thirds">
		<div data-petfinder-app="main">Enter your developer key and a shelter ID in the box above to get started.</div>
	</div>
</div>

<div data-petfinder-template="all" hidden>
	<div class="{{classes}}">
		<div data-petfinder-img-container>
			<img src="{{photo.1.medium}}">
		</div>
		<h2>{{name}}</h2>
		<p><a href="{{url.pet}}">View Full Profile</a></p>
		<hr>
	</div>
</div>

<div data-petfinder-template="one" hidden>
	<p><a href="{{url.all}}">&larr; Back to Full List</a></p>
	<div data-petfinder-img-container>
		<div data-petfinder-img></div>
		<p>
			<a target="_blank" href="{{photo.1.large}}"><img src="{{photo.1.thumbnail.large}}"></a>&nbsp;
			<a target="_blank" href="{{photo.1.large}}"><img src="{{photo.2.thumbnail.large}}"></a>&nbsp;
			<a target="_blank" href="{{photo.1.large}}"><img src="{{photo.3.thumbnail.large}}"></a>
		</p>
	</div>
	<h2>{{name}}</h2>
	<p>
		Age: {{age}}<br>
		Gender: {{gender}}<br>
		Size: {{size}}
	</p>
	<p>{{options.multi}}</p>
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