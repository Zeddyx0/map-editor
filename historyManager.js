var prevOverlays = [];
var presentOverlays = [];
var undoneOverlays = [];
var cycleComplete = true;
var overlaysJSON = [];
var overlaysJSONArr = [];

function undo() {

	for (var i = 0; i < overlays.length; i++) {
		overlays[i].setMap(null);
	}
	if (prevOverlays.length != 0) {
		selectedShapes = [];
		overlays = [];
		undoneOverlaysPush();
		var prev_overlay = prevOverlays.pop();

		if (prev_overlay.length > 0) {
			for (var i = 0; i < prev_overlay.length; i++) {
				overlays[i] = prev_overlay[i];
				overlays[i].setMap(map);
				overlays[i].draggable = draggableState;
			}
		}
	}
}

function setSavedOverlays() {
	console.log("stage1");
	for (var i = 0; i < overlays.length; i++) {
		overlays[i].setMap(null);
	}
	if (overlaysJSONArr.length != 0) {
		//selectedShapes = [];
		//overlays = [];
		var overlays_copy = [];
		for (var i = 0; i < overlaysJSONArr.length; i++) {
			var clone_shape = cloneShape(overlaysJSONArr[i]);
			console.log(cloneShape);
			if (overlayItemIsShape(clone_shape)) {
				addShapeListeners(clone_shape, null); // don't have an overlay event!
			} else {
				addMarkerListeners(clone_shape, null); // don't have an overlay event!
			}
			overlays_copy[i] = clone_shape;
		}
		overlaysJSON = [];
		overlaysJSON.push(overlays_copy);
		
		
		
		if (overlaysJSON.length > 0) {
			for (var i = 0; i < overlaysJSON.length; i++) {
				console.log(overlaysJSON);
				overlays[i] = overlaysJSON[i];
				console.log(overlays);
				
				overlays[i].setMap(map);
				overlays[i].draggable = draggableState;
				
			}
		}
	}
}

function redo() {

	if (undoneOverlays.length != 0) {
		selectedShapes = [];
		for (var i = 0; i < overlays.length; i++) {
			overlays[i].setMap(null);
		}

		overlays = [];
		var lastEntry = undoneOverlays[undoneOverlays.length - 1];
		for (var i = 0; i < lastEntry.length; i++) {
			overlays[i] = lastEntry[i];
			overlays[i].setMap(map);
			overlays[i].draggable = draggableState;
		}

		var conditionPrevious = presentOverlays[0];
		if (conditionPrevious !== undefined) {
			if (conditionPrevious.length == 0) {
				prevOverlays.push(presentOverlays[0]);
			} else {
				var overlays_copy = [];
				for (var i = 0; i < presentOverlays[0].length; i++) {
					var clone_shape = cloneShape(presentOverlays[0][i]);
					if (overlayItemIsShape(clone_shape)) {
						addShapeListeners(clone_shape, null);
					} else {
						addMarkerListeners(clone_shape, null);
					}
					overlays_copy[i] = clone_shape;
				}
				prevOverlays.push(overlays_copy);
			}
		}
		presentOverlays = [];
		presentOverlays.push(undoneOverlays[undoneOverlays.length - 1]);
		undoneOverlays.pop();
	}
}

function clonePath(path) {
	var clone_path = [];

	for (var i = 0; i < path.length; i++) {
		var lati = path.getAt(i).lat();
		//console.log(path);
		var lngi = path.getAt(i).lng();
		clone_lat_lng = {
			lat: lati,
			lng: lngi
		};
		clone_path.push(clone_lat_lng);
	}

	return clone_path;
}

function clonePolyline(polyline) {
	var geodesic = polyline.geodesic;
	var strokeColor = polyline.strokeColor;
	var strokeOpacity = polyline.strokeOpacity;
	var strokeWeight = polyline.strokeWeight;
	var JSONSave = typeof polyline.getPath !== "function";
	console.log(JSONSave)
	if(JSONSave){
		var path = polyline.latLngs.j[0].j;
		var clone_path = path;
		
	} else{
		var path = polyline.getPath();
		var clone_path = clonePath(path);	
	}
	var clone_polyline = new google.maps.Polyline({
			geodesic: geodesic,
			strokeColor: strokeColor,
			strokeOpacity: strokeOpacity,
			strokeWeight: strokeWeight,
			path: clone_path,
			draggable: draggableState,
			editable: false
		});

	clone_polyline.type = google.maps.drawing.OverlayType.POLYLINE;

	return clone_polyline;
}

function clonePolygon(polygon) {
	var geodesic = polygon.geodesic;
	var strokeColor = polygon.strokeColor;
	var strokeOpacity = polygon.strokeOpacity;
	var strokeWeight = polygon.strokeWeight;
	var fillColor = polygon.fillColor;
	var fillOpacity = polygon.fillOpacity;
	var JSONSave = typeof polygon.getPath !== "function";
	console.log(JSONSave)
	if(JSONSave){
		var path = polygon.latLngs.j[0].j;
		var clone_path = path;
		
	} else{
		var path = polygon.getPath();
		var clone_path = clonePath(path);
		console.log(path);	
	}	
	var clone_polygon = new google.maps.Polygon({
			geodesic: geodesic,
			strokeColor: strokeColor,
			strokeOpacity: strokeOpacity,
			strokeWeight: strokeWeight,
			fillColor: fillColor,
			fillOpacity: fillOpacity,
			path: clone_path,
			draggable: draggableState,
			editable: false
		});
	clone_polygon.type = google.maps.drawing.OverlayType.POLYGON;
	return clone_polygon;
}

function cloneRectangle(rect) {
	var strokeColor = rect.strokeColor;
	var strokeOpacity = rect.strokeOpacity;
	var strokeWeight = rect.strokeWeight;
	var fillColor = rect.fillColor;
	var fillOpacity = rect.fillOpacity;
	var type = rect.type;
	var JSONSave = typeof rect.getBounds !== "function";
	if(JSONSave){
		var north = rect.bounds.north;
		var south = rect.bounds.south;
		var east = rect.bounds.east;
		var west = rect.bounds.west;
		if (!isNaN(north) && !isNaN(south) && !isNaN(west) && !isNaN(east)) {
			var NE = new google.maps.LatLng(north, east);
			var SW = new google.maps.LatLng(south, west);
			var bounds = new google.maps.LatLngBounds(SW, NE);
		}		
	} else {
		var bounds = rect.getBounds();
	}
	var clone_rect = new google.maps.Rectangle({
			strokeColor: strokeColor,
			strokeOpacity: strokeOpacity,
			strokeWeight: strokeWeight,
			fillColor: fillColor,
			fillOpacity: fillOpacity,
			bounds: bounds,
			draggable: draggableState,
			editable: false,
			type: type
		});
	console.log(JSON.stringify(clone_rect));
	clone_rect.type = google.maps.drawing.OverlayType.RECTANGLE;
	return clone_rect;
}

function cloneCircle(circ) {
	var strokeColor = circ.strokeColor;
	var strokeOpacity = circ.strokeOpacity;
	var strokeWeight = circ.strokeWeight;
	var fillColor = circ.fillColor;
	var fillOpacity = circ.fillOpacity;
	var center = circ.center;
	var radius = circ.radius;
	//var editable      = rect.editable;

	var clone_circ = new google.maps.Circle({
			strokeColor: strokeColor,
			strokeOpacity: strokeOpacity,
			strokeWeight: strokeWeight,
			fillColor: fillColor,
			fillOpacity: fillOpacity,
			center: center,
			radius: radius,
			draggable: draggableState,
			editable: false
		});

	clone_circ.type = google.maps.drawing.OverlayType.CIRCLE;

	
	return clone_circ;
}

function cloneMarker(marker) {
	var anchorPoint = marker.anchorPoint;
	var JSONSave = typeof marker.getPosition !== "function";
	if(JSONSave){
		var position = marker.position;
	} else{
		var position = marker.getPosition();
	}
	var clone_marker = new google.maps.Marker({
			anchorPoint: anchorPoint,
			position: position,
			clickable: true,
			draggable: draggableState,
			editable: false
		})
		clone_marker.type = google.maps.drawing.OverlayType.MARKER;

	return clone_marker;
}

function cloneShape(shape) {
	console.log(shape.type);
	if (shape.type === google.maps.drawing.OverlayType.POLYLINE) {
		var clone_polyline = clonePolyline(shape);
		return clone_polyline;
	} else if (shape.type === google.maps.drawing.OverlayType.POLYGON) {
		var clone_polygon = clonePolygon(shape);
		return clone_polygon;
	} else if (shape.type === google.maps.drawing.OverlayType.RECTANGLE) {
		var clone_rect = cloneRectangle(shape);
		return clone_rect;
		
	} else if (shape.type === google.maps.drawing.OverlayType.CIRCLE) {
		var clone_circ = cloneCircle(shape);
		return clone_circ;

	} else {
		var clone_marker = cloneMarker(shape);
		return clone_marker;
	}
}

function overlayItemIsShape(overlay_item) {
	var type = overlay_item.type;
	

	
	is_shape = (type === google.maps.drawing.OverlayType.POLYLINE)
	 || (type === google.maps.drawing.OverlayType.POLYGON)
	 || (type === google.maps.drawing.OverlayType.RECTANGLE)
	 || (type === google.maps.drawing.OverlayType.CIRCLE);

	return is_shape;
}

function historyOverlayPush() {
	if (cycleComplete) {
		var overlays_copy = [];
		for (var i = 0; i < overlays.length; i++) {
			var clone_shape = cloneShape(overlays[i]);
			
			if (overlayItemIsShape(clone_shape)) {
				addShapeListeners(clone_shape, null); // don't have an overlay event!
			} else {
				addMarkerListeners(clone_shape, null); // don't have an overlay event!
			}
			overlays_copy[i] = clone_shape;
		}
		undoneOverlays = [];
		prevOverlays.push(overlays_copy);
	}

	cycleComplete = false;
}
function presentOverlayPush() {
	
	var counter = 1;
	OVbeforeClearing = overlays;
	PObeforeClearing = presentOverlays;
	presentOverlays = [];
	overlaysJSONArr = [];
	var overlays_copy = [];
	for (var i = 0; i < overlays.length; i++) {
		var clone_shape = cloneShape(overlays[i]);
		//not an overlay item yet
		overlaysJSONArr.push('{"overlay' + counter + '": [' + JSON.stringify(clone_shape) +']}' );
		console.log(JSON.stringify(clone_shape));
		
		//console.log('{"overlay' + counter + '": [' + JSON.stringify(clone_shape) +']}' );
		if (overlayItemIsShape(clone_shape)) {
			//overlay item here
			addShapeListeners(clone_shape, null); // don't have an overlay event!
		} else {
			addMarkerListeners(clone_shape, null); // don't have an overlay event!
		}
		overlays_copy[i] = clone_shape;
		//console.log(JSON.stringify(clone_shape));
		counter++;
	}
	presentOverlays.push(overlays_copy);
	cycleComplete = true;
	
}

function undoneOverlaysPush() {

	var conditionUndone = presentOverlays[presentOverlays.length - 1] !== undefined;

	if (conditionUndone) {
		var overlays_copy = [];
		for (var i = 0; i < presentOverlays[0].length; i++) {
			var clone_shape = cloneShape(presentOverlays[0][i]);
			if (overlayItemIsShape(clone_shape)) {
				addShapeListeners(clone_shape, null); // don't have an overlay event!
			} else {
				addMarkerListeners(clone_shape, null); // don't have an overlay event!
			}
			overlays_copy[i] = clone_shape;
		}
		undoneOverlays.push(overlays_copy);
	}

	var conditionPresent = prevOverlays[prevOverlays.length - 1] !== undefined;

	if (conditionPresent) {
		presentOverlays = [];
		var overlays_copy = [];
		for (var i = 0; i < prevOverlays[prevOverlays.length - 1].length; i++) {
			var clone_shape = cloneShape(prevOverlays[prevOverlays.length - 1][i]);
			if (overlayItemIsShape(clone_shape)) {
				addShapeListeners(clone_shape, null); // don't have an overlay event!
			} else {
				addMarkerListeners(clone_shape, null); // don't have an overlay event!
			}
			overlays_copy[i] = clone_shape;
		}
		presentOverlays.push(overlays_copy);
	}
}