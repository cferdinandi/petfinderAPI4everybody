<div id="pf-api-data">
	<p>Your browser does not support the JavaScript APIs required to use this script. Sorry.</p>
</div>

<div data-petfinder-app="aside"></div>
<div data-petfinder-app="main">Enter your developer key and a shelter ID in the box above to get started.</div>

<div data-petfinder-template="all" hidden>
	<div class="{{classes}}">
		<p><img src="{{photo.1.large}}"></p>
		<h2>{{name}}</h2>
		<p><a data-petfinder-async href="{{url.pet}}">View Full Profile</a></p>
		<hr>
	</div>
</div>

<div data-petfinder-template="one" hidden>
	<p><a data-petfinder-async href="{{url.all}}">&larr; Back to Full List</a></p>
	<h2>{{name}}</h2>
	<p>
		Age: {{age}}<br>
		Gender: {{gender}}<br>
		Size: {{size}}
	</p>
	<div>{{description}}</div>
</div>