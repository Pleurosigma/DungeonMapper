<!DOCTYPE html>
<html>
	<head>
		<title>Dungeon Mapper</title>
		<script src='https://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js'></script>
		<script src='/dungeon-mapper/scripts/alchemy-1.0.0.js'></script>
		<script src='/dungeon-mapper/scripts/main.js'></script>
		<link rel='stylesheet' type='text/css' href='/dungeon-mapper/css/main.css'>
	</head>
	<body>
		<h1>Dungeon Mapper</h1>
		<div id='dungeon-container'>
			<form id='dungeon-mapper-controls'>
				<label for='selectedType'>Type:</label>
				<input type='text' name='selectedType' />
				<label for='selectedOrientation'>Orientation:</label>
				<input type='text' name='selectedOrientation' />
				<button id='update-button' type='button'>Update</button>
			</form>
			<canvas id='dungeon' width='200' height='200' />
		</div>
	</body>
</html>