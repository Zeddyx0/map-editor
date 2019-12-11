var debug = false;
var shiftKeyPressed = false;
var beingDragged = false;
var resizeEntry = false;
var allowDeselect = true;
var colors = ['#1E90FF', '#FF1493', '#4B0082', '#32CD32', '#FF8C00', '#000000'];
var selectedColor;
var colorButtons = {};
var thicknessValue = 1;
var opacityValue = 0.4;
var draggableState = true
var overlays = [];
var entryType = [];
var drawingManager;
var selectedShape;
var selectedShapes = [];
var map = null;
var dragS, dragN;
var dsNorth, dsSouth, dsEast, dsWest;
var gaj, gal, maj, mal;
var listenersArray = [];
var counter = 0;
var branchNum = 1;
var mouseState = "up";
var thicknessRangeListener = thicknessValue;
var resizable = false;
var dontResize = false;
var updateMap = false;
var polyOptions = {

	fillColor: '#CA4A2F',
	strokeWeight: thicknessValue,
	fillOpacity: opacityValue,
	editable: true,
	draggable: draggableState,
	geodesic: false
};
var data = {
    "type": "FeatureCollection",
    "features": [{
		"type": "Feature",
		"geometry": {
			"type": "Point",
			"coordinates": [-0.120850, 51.508742]
		},
		"properties": {}
    }]
};
$(function () {
	//change draggable
	var draggableCB = document.querySelector("input[name=draggableCB]");
	draggableCB.addEventListener('change', function () {
		if (this.checked) {
			draggableState = false;
			for (var i = 0; i < overlays.length; i++) {
				overlays[i].draggable = draggableState;
				polyOptions.draggable = draggableState;
				console.log("false");
			}
			//console.log(overlays[i].draggable);
		} else {
			draggableState = true;
			for (var i = 0; i < overlays.length; i++) {
				overlays[i].draggable = draggableState;
				polyOptions.draggable = draggableState;
				console.log("true");
			}
		}
	});

	//Update thickness
	var thicknessSlider = document.getElementById("thicknessRange");
	var thicknessSliderOutput = document.getElementById("thicknessRangeVal");
	thicknessSliderOutput.innerHTML = thicknessSlider.value / 20;
	thicknessSlider.oninput = function () {
		shapeSpecsChangeMD();
		thicknessSliderOutput.innerHTML = this.value / 20;
		thicknessValue = this.value / 20;
		polyOptions.strokeWeight = thicknessValue;
		setSelectedThickness(thicknessValue);

	}
	//Update opacity
	var opacitySlider = document.getElementById("colourOpacity");
	var opacitySliderOutput = document.getElementById("opacityRangeVal");
	opacitySliderOutput.innerHTML = "% " + Math.round(opacitySlider.value);

	opacitySlider.oninput = function () {
		shapeSpecsChangeMD();
		opacityValue = this.value / 100;
		polyOptions.fillOpacity = opacityValue;
		opacitySliderOutput = opacityValue;
		opacityRangeVal.innerHTML = "% " + Math.round(opacitySliderOutput * 100);
		setSelectedOpacity(opacityValue);
	}

	document.getElementById("color-palette1").addEventListener("mousedown", shapeSpecsChangeMD);
	document.getElementById("thicknessRange").addEventListener("mouseup", shapeSpecsChangeMU);
	document.getElementById("colourOpacity").addEventListener("mouseup", shapeSpecsChangeMU);
	document.onmousemove = mouseMove;
	document.onmousedown = mouseDown;
	document.onmouseup = mouseUp;

});


function settingThePath() {
	listenersArray = []
	counter = 0;
	branchNum = 1;

	for (var i = 0; i < selectedShapes.length * 2; i++) {
		for (var j = 1; j < 6; j++) {
			var path = "//*[@id='map']/div/div/div[1]/div[3]/div/div[3]/div[" + branchNum + "]/div[" + j + "]/div";
			listenersArray[counter] = getElementByXpath(path);
			//console.log(listenersArray[counter]);
			//console.log(path);
			if (listenersArray[counter] !== (undefined || null)) {
				//console.log("array added", listenersArray[counter]);
				listenersArray[counter].addEventListener("mousemove", function () {
					resizable = true;
					shapeResize();
				});
				listenersArray[counter].addEventListener("mouseout", function () {
					if (mouseDown) {
						resizable = true;
						shapeResize();
					}
				});
			}
			counter++;
		}
		branchNum++;
	}
}



function shapeResize() {
	if (mouseState == "down") {
		if (selectedShapes.length > 0) {
			if (resizable) {
				if(dontResize == false){
					historyOverlayPush();
				}
				
			}
		}
	}
}

function shapeSpecsChangeMD() {

	if (selectedShapes.length > 0) {
		historyOverlayPush();
	}
}

function shapeSpecsChangeMU() {
	if (selectedShapes.length > 0) {
		//console.log("this fires");
		presentOverlayPush();
	}
}

function makeColorButton(color) {
	var button = document.createElement('span');
	button.className = 'color-buttons1';
	button.style.backgroundColor = color;
	google.maps.event.addDomListener(button, 'click', function () {
		selectColor(color);
		setSelectedShapeColor(color);
		shapeSpecsChangeMU();
	});
	return button;
}
function buildColorPalette() {
	var colorPalette = document.getElementById('color-palette1');
	//var para = document.createElement("p");
	//var node = document.createTextNode("This is new.");
	//para.appendChild(node);
	//colorPalette.appendChild(para);
	
	for (var i = 0; i < colors.length; ++i) {
		var currColor = colors[i];
		var colorButton = makeColorButton(currColor);
		colorPalette.appendChild(colorButton);
		colorButtons[currColor] = colorButton;
	}
	selectColor(colors[0]);
};
function selectColor(color) {
	selectedColor = color;
	for (var i = 0; i < colors.length; ++i) {
		var currColor = colors[i];
		colorButtons[currColor].style.border = currColor == color ? '2px solid #789' : '2px solid #fff';
	}

	// Retrieves the current options from the drawing manager and replaces the
	// stroke or fill color as appropriate.
	var polylineOptions = drawingManager.get('polylineOptions');
	polylineOptions.strokeColor = color;
	drawingManager.set('polylineOptions', polylineOptions);

	var rectangleOptions = drawingManager.get('rectangleOptions');
	rectangleOptions.fillColor = color;
	drawingManager.set('rectangleOptions', rectangleOptions);

	var circleOptions = drawingManager.get('circleOptions');
	circleOptions.fillColor = color;
	drawingManager.set('circleOptions', circleOptions);

	var polygonOptions = drawingManager.get('polygonOptions');
	polygonOptions.fillColor = color;
	drawingManager.set('polygonOptions', polygonOptions);
}

function initMap() {

	map = new google.maps.Map(document.getElementById('map'), {
			center: {
				lat: -37.7891,
				lng: 175.3180
			},
			zoom: 3,
		});
	if(updateMap){
		map.data.loadGeoJson('https://storage.googleapis.com/mapsdevsite/json/google.json');

	}

	// Add a style-selector control to the map.
	var styleControl = document.getElementById('style-selector-control');
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(styleControl);

	// Set the map's style to the initial value of the selector.
	var styleSelector = document.getElementById('style-selector');
	console.log(styleSelector);
	map.setOptions({
		styles: styles[styleSelector.value]
	});

	// Apply new JSON when the user selects a different style.
	styleSelector.addEventListener('change', function () {
		map.setOptions({
			styles: styles[styleSelector.value]
		});
	});

	drawingManager = new google.maps.drawing.DrawingManager({
			drawingMode: null,
			drawingControl: true,
			drawingControlOptions: {
				position: google.maps.ControlPosition.TOP_CENTER,
				drawingModes: ['marker', 'circle', 'polygon', 'polyline', 'rectangle']
			},
			markerOptions: {
				draggable: draggableState
			},
			circleOptions: polyOptions,
			polylineOptions: polyOptions,
			polygonOptions: polyOptions,
			rectangleOptions: polyOptions,
		});

	drawingManager.setMap(map);

	google.maps.event.addListener(drawingManager, "drawingmode_changed", function () {
		if(shiftKeyPressed != true && drawingManager.drawingMode !== null){
			deselectAll();
		}
		settingThePath();

	})

	// store reference to added overlay
	google.maps.event.addListener(drawingManager, 'overlaycomplete', function (e) {

		allowDeselect = true;
		
		//console.log(e);
		historyOverlayPush();

		overlays.push(e.overlay); // store reference to added overlay
		var newShape = e.overlay;
		newShape.type = e.type;
		//console.log("this fires");
		presentOverlayPush();

		if (e.type !== google.maps.drawing.OverlayType.MARKER) {
			addShapeListeners(newShape, e);
			setSelection(newShape, e);
		} else {

			addMarkerListeners(newShape, e);
			setSelection(newShape, e);
		}
	});

	//Clears selection if clicked on the map when shift is not presseed
	google.maps.event.addListener(map, 'click', function (e) {
		var c = document.body.childNodes;
		if (e.target && e.target.matches("a.classA")) {
			console.log("Anchor element clicked!");
		}
		if (shiftKeyPressed == false) {
			clearSelection();
			selectedShape = null;
		}
	});
	
	google.maps.event.addListener(map, 'mousedown', function (e) {
		dontResize = true;
	});	
	
	google.maps.event.addListener(map, 'mouseup', function (e) {
		dontResize = false;
	});	
	
	//Keyboard shortcuts
	document.addEventListener('keydown', function () {
		if (event.code == 'KeyY' && (event.ctrlKey || event.metaKey) || (event.code == 'KeyZ' && event.code == 'ShiftLeft' && (event.ctrlKey || event.metaKey))) {
			redo();
		}
		if (event.code == 'KeyZ' && (event.ctrlKey || event.metaKey)) {
			if (shiftKeyPressed == false) {
				undo();
			}
		}
		if (event.code == 'KeyA' && (event.ctrlKey || event.metaKey)) {
			event.preventDefault();
			drawingManager.setDrawingMode(null);
			selectAll();
			
		}
		if (event.code == 'KeyD' && (event.ctrlKey || event.metaKey)) {
			event.preventDefault();
			deselectAll();
		}
		if (event.code == 'KeyE') {
			setSavedOverlays();
		}		
		if (event.code == 'Digit0' || event.code == 'Numpad0' || event.code == 'Backquote') {

			drawingManager.setDrawingMode(null);
		} else if (event.code == 'Digit1') {
			drawingManager.setDrawingMode('marker');
		} else if (event.code == 'Digit2') {
			drawingManager.setDrawingMode('circle');
		} else if (event.code == 'Digit3') {
			drawingManager.setDrawingMode('polygon');
		} else if (event.code == 'Digit4') {
			drawingManager.setDrawingMode('polyline');
		} else if (event.code == 'Digit5') {
			drawingManager.setDrawingMode('rectangle');
		} else if (event.code == 'KeyQ') {
			printHistory();
		}
		//							console.log(event.code);
	});

	//Sets shift as pressed
	document.addEventListener('keydown', function () {
		if (event.code == 'ShiftLeft' || event.code == 'ShiftRight') {
			shiftKeyPressed = true;

		}

	});

	//Sets shift as unpressed
	document.addEventListener('keyup', function () {
		if (event.code == 'ShiftLeft' || event.code == 'ShiftRight') {
			shiftKeyPressed = false;
		}

	});

	buildColorPalette();
}

//Deletes a vertex if clicked on it
function vertexAndPolyDel(e, newShape) {
	var vertex = e.vertex;
	//console.log(e)
	if (e.vertex !== undefined) {
		//console.log("this fires");
		if (newShape.type === google.maps.drawing.OverlayType.POLYGON) {
			var path = newShape.getPaths().getAt(e.path);
			path.removeAt(e.vertex);
			if (path.length < 3) {
				newShape.setMap(null);
			}
		}
		if (newShape.type === google.maps.drawing.OverlayType.POLYLINE) {
			var path = newShape.getPath();
			path.removeAt(e.vertex);
			if (path.length < 2) {
				newShape.setMap(null);
			}
		} //console.log("this fires");
	}
}

function addMarkerListeners(newShape, e) {
	//cLICK EVENT IF A MARKER IS CREATED
	google.maps.event.addListener(newShape, 'click', function (e) {
		setSelection(newShape, e);
	});

	google.maps.event.addListener(newShape, 'dragstart', function (e) {
		beingDragged = true;
		//console.log("this fires");
		historyOverlayPush();

	});

	google.maps.event.addListener(newShape, 'dragend', function () {
		beingDragged = false;
		//console.log("this fires");
		presentOverlayPush();
		allowDeselect = false;
	});
}

function applyDrag(newShape) {
	for (var i = 0; i < selectedShapes.length; i++) {
		//mal = 0;
		//maj = 0;
		//gal = 0;
		//gaj = 0;

		//mal = selectedShapes[i].bounds.ma.l - newShape.bounds.ma.l;
		//maj = selectedShapes[i].bounds.ma.j - newShape.bounds.ma.j;
		//gal = selectedShapes[i].bounds.ga.l - newShape.bounds.ga.l;
		//gaj = selectedShapes[i].bounds.ga.j - newShape.bounds.ga.j;

		mal = newShape.bounds.ma.l - dsNorth;
		maj = newShape.bounds.ma.j - dsSouth;
		gal = newShape.bounds.ga.l - dsEast;
		gaj = newShape.bounds.ga.j - dsWest;

		var north = selectedShapes[i].bounds.ma.l;
		var south = selectedShapes[i].bounds.ma.j;
		var east = selectedShapes[i].bounds.ga.l + gal;
		var west = selectedShapes[i].bounds.ga.j + gaj;
		if (!isNaN(north) && !isNaN(south) && !isNaN(west) && !isNaN(east)) {
			var NE = new google.maps.LatLng(north, east);
			var SW = new google.maps.LatLng(south, west);
			var newRect = new google.maps.LatLngBounds(SW, NE);
			selectedShapes[i].setBounds(newRect);
		}
	}
}

function addShapeListeners(newShape, e) {
	// Add an event listener that selects the newly-drawn shape when the user
	// mouses down on it.
	google.maps.event.addListener(newShape, 'click', function (e) {

		vertexAndPolyDel(e, newShape);

	});

	google.maps.event.addListener(newShape, 'dragstart', function (e) {


		allowDeselect = false;
		console.log("hey");
		historyOverlayPush();
	});



	google.maps.event.addListener(newShape, 'dragend', function () {
		beingDragged = false;
		presentOverlayPush();
		settingThePath();
		
		allowDeselect = false;
		setSelection(newShape, e);
	});

	//Store information after the event ends
	google.maps.event.addListener(newShape, 'bounds_changed', function (e) {
		if (beingDragged == false) {
			presentOverlayPush();
		}
	});

	//Add an event listener to select a shape if the mouse hovers over it
	google.maps.event.addListener(newShape, 'mousedown', function (e) {
		//console.log("this fires");
		if (e.target && e.target.matches("a.classA")) {
			console.log("Anchor element clicked!");
		}
		//console.log(e);
		if (e.vertex !== undefined || e.edge !== undefined) {
			//console.log("this fires");
			historyOverlayPush()
		}
		if (drawingManager.drawingMode == null) {
			setSelection(newShape, e);
		}
	});

	google.maps.event.addListener(newShape, 'mouseup', function (e) {
		console.log("mouseup");
		if (e.vertex !== undefined || e.edge !== undefined) {
			//console.log("this fires");
			presentOverlayPush()
		} else {
			//setSelection(newShape, e);
		}
		
	});
}
function clearSelection() {
	if (selectedShape) {
		if (selectedShape.type !== 'marker') {
			selectedShape.setEditable(false);
			if (shiftKeyPressed == false) {
				for (var i = 0; i < selectedShapes.length; i++) {
					selectedShapes[i].setEditable(false);
				}
				selectedShapes = [];
			}
		}
		selectedShape = null;
	}
}

//Set selection for the selected overlay
function setSelection(shape, e) {
	if (shape.type !== 'marker') {
		if (shiftKeyPressed == false) {
			if(e !== null) {
				if (e.vertex == undefined) {
					if (e.edge == undefined) {
						clearSelection();
						shape.setEditable(true);
					}
				}				
			}
		}
		if (selectedShapes.includes(shape)) {
			if(e !== null){
				if (e.vertex == undefined) {
					if (e.edge == undefined) {
						allowDeselect = true;
						removeFromSelectedShapes(shape);
					}
				}
			}
		} else {
			allowDeselect = false;
			shape.setEditable(true);
			selectedShapes.push(shape);
		}

		//Send the values to be updated
		var thi = shape.strokeWeight;
		var opa = shape.fillOpacity;
		var fCol = shape.fillColor;
		var sCol = shape.strokeColor;
		updateMenuValues(thi, opa, fCol, sCol);

	} else if (shape.type == 'marker') {
		clearSelection();
	}
	selectedShape = shape;
	settingThePath();
}

function removeFromSelectedShapes(shape) {
	if (selectedShapes.includes(shape)) {
		if (allowDeselect) {
			const index = selectedShapes.indexOf(shape);
			console.log(index);
			selectedShapes.splice(index, 1);
			shape.setEditable(false);
		}
		console.log("allowDeselect",allowDeselect);
		allowDeselect = true;
	} 
	console.log(selectedShapes.length);
}

//Set selected thickness
function setSelectedThickness(sWeight) {
	if (selectedShapes.length > 0) {
		//historyOverlayPush();
		for (var i = 0; i < selectedShapes.length; i++) {
			selectedShapes[i].set('strokeWeight', sWeight);
			//console.log(selectedShapes.length);
		}
	}
}

//Set selected opacity
function setSelectedOpacity(fOpacity) {

	if (selectedShapes.length > 0) {
		for (var i = 0; i < selectedShapes.length; i++) {
			selectedShapes[i].set('fillOpacity', fOpacity);
		}
	}
}

//set selected fill colour
function setSelectedShapeColor(color) {
	if (selectedShapes.length > 0) {
		for (var i = 0; i < selectedShapes.length; i++) {
			selectedShapes[i].set('fillColor', color);
			selectedShapes[i].set('strokeColor', color);
		}
	}
}
function getElementByXpath(path) {
	return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

function updateMenuValues(thi, opa, fCol, sCol) {
	//Update thickness slider and value on the settings menu
	var thicknessSliderOutput = document.getElementById("thicknessRangeVal");
	thicknessSliderOutput.innerHTML = thi;
	document.getElementById("thicknessRange").value = thi * 20;

	//Update the opacity slider and value on the settings menu
	var opacitySliderOutput = document.getElementById("opacityRangeVal");
	opacitySliderOutput.innerHTML = "% " + opa * 100;
	document.getElementById("colourOpacity").value = opa * 100;

	if (drawingManager.drawingMode == null) {
		selectColor(fCol);
	}
}
function selectAll() {
	shiftKeyPressed = true;
	var e = new Object();
	e.vertex = undefined;
	selectedShapes = [];
	for (var i = 0; i < overlays.length; i++) {
		setSelection(overlays[i], e);
	}
	shiftKeyPressed = false;
}

function deselectAll() {
	for (var i = 0; i < selectedShapes.length; i++) {
		selectedShapes[i].setEditable(false);
	}
	selectedShapes = [];
}

function printHistory() {
	console.log("prev", prevOverlays);
	console.log("present ", presentOverlays);
	console.log("undone ", undoneOverlays);
	console.log(mouseState);
	console.log(JSON.stringify(overlaysJSONArr).replace(/\\/g,''));
	
	printGeoJSon();


}

function printGeoJSon(){
//map.getGeoJson(function(geo){console.log(map.data.addGeoJson(geo));});
	//updateMap = true;
	//initMap();
    //map.data.toGeoJson(function (data) {
	//	console.log(JSON.stringify(data));
    //});
	//var blob = new Blob([sfg]),
	//{type: "text/plain;charset=utf-8"}
	//);
	//saveAs(blob, "testfile1.text")
}


function mouseMove(ev) {

	//How can I know the state of mouse from here
	if (mouseState == 'down') {
		//console.log('mouse down state')
	}

	if (mouseState == 'up') {
		//console.log('mouse up state')
	}
}

function mouseDown(ev) {
	mouseState = "down";
	//    console.log('Down State you can now start dragging');
	//do not write any code here in this function
}

function mouseUp(ev) {
	mouseState = "up";
	//    console.log('up state you cannot drag now because you are not holding your mouse')
	//do not write any code here in this function
}

function deleteSelectedShape() {
	//console.log("this fires");
	historyOverlayPush();
	for (var i = 0; i < selectedShapes.length; i++) {
		selectedShapes[i].setMap(null);

		if (overlays.includes(selectedShapes[i])) {
			const index = overlays.indexOf(selectedShapes[i]);
			overlays.splice(index, 1);
			selectedShapes[i].setEditable(false);
		}
	}
	selectedShapes = [];
	//console.log("this fires");
	presentOverlayPush();
}

function deleteAllShape() {
	//console.log("this fires");
	historyOverlayPush();
	for (var i = 0; i < overlays.length; i++) {
		overlays[i].setMap(null);
	}
	overlays = [];
	//console.log("this fires");
	presentOverlayPush();
}