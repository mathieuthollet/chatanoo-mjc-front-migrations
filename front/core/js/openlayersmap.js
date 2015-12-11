/* Mathieu Lot 2 */
function initOpenLayersMap() {
	/**
	 * Define a namespace for the application.
	 */
	window.app = {};
	var app = window.app;
	
	
	
	/**
	 * @constructor
	 * @extends {ol.interaction.Pointer}
	 */
	app.Drag = function() {
	
	  ol.interaction.Pointer.call(this, {
	    /*handleDownEvent: app.Drag.prototype.handleDownEvent,
	    handleDragEvent: app.Drag.prototype.handleDragEvent,
	    handleMoveEvent: app.Drag.prototype.handleMoveEvent,*/
	    handleUpEvent: app.Drag.prototype.handleUpEvent
	  });
	
	  /**
	   * @type {ol.Pixel}
	   * @private
	   */
	  this.coordinate_ = null;
	
	  /**
	   * @type {string|undefined}
	   * @private
	   */
	  this.cursor_ = 'pointer';
	
	  /**
	   * @type {ol.Feature}
	   * @private
	   */
	  this.feature_ = null;
	
	  /**
	   * @type {string|undefined}
	   * @private
	   */
	  this.previousCursor_ = undefined;
	
	};
	ol.inherits(app.Drag, ol.interaction.Pointer);
	
	
	/**
	 * @param {ol.MapBrowserEvent} evt Map browser event.
	 * @return {boolean} `true` to start the drag sequence.
	 */
	app.Drag.prototype.handleDownEvent = function(evt) {
	  var map = evt.map;
	
	  var feature = map.forEachFeatureAtPixel(evt.pixel,
	      function(feature, layer) {
	        return feature;
	      }
	  );
	
	  if (feature) {
	    this.coordinate_ = evt.coordinate;
	    this.feature_ = feature;
	  }
	
	  return !!feature;
	};
	
	
	/**
	 * @param {ol.MapBrowserEvent} evt Map browser event.
	 */
	app.Drag.prototype.handleDragEvent = function(evt) {
	  var map = evt.map;
	
	  var feature = map.forEachFeatureAtPixel(evt.pixel,
	      function(feature, layer) {
	        return feature;
	      });
	
	  var deltaX = evt.coordinate[0] - this.coordinate_[0];
	  var deltaY = evt.coordinate[1] - this.coordinate_[1];
	
	  var geometry = /** @type {ol.geom.SimpleGeometry} */
	      (this.feature_.getGeometry());
	  geometry.translate(deltaX, deltaY);
	
	  this.coordinate_[0] = evt.coordinate[0];
	  this.coordinate_[1] = evt.coordinate[1];
	};
	
	
	/**
	 * @param {ol.MapBrowserEvent} evt Event.
	 */
	app.Drag.prototype.handleMoveEvent = function(evt) {
	  if (this.cursor_) {
	    var map = evt.map;
	    var feature = map.forEachFeatureAtPixel(evt.pixel,
	        function(feature, layer) {
	          return feature;
	        });
	    var element = evt.map.getTargetElement();
	    if (feature) {
	      if (element.style.cursor != this.cursor_) {
	        this.previousCursor_ = element.style.cursor;
	        element.style.cursor = this.cursor_;
	      }
	    } else if (this.previousCursor_ !== undefined) {
	      element.style.cursor = this.previousCursor_;
	      this.previousCursor_ = undefined;
	    }
	  }
	};
	
	
	/**
	 * @param {ol.MapBrowserEvent} evt Map browser event.
	 * @return {boolean} `false` to stop the drag sequence.
	 */
	app.Drag.prototype.handleUpEvent = function(evt) {
	  var lonlat = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
	  var lon = lonlat[0];
	  var lat = lonlat[1];
	  alert(lon + ', ' + lat);
	  return false;
	};
	
	
	var pointFeature = new ol.Feature(new ol.geom.Point([0, 0]));
	
	var map = new ol.Map({
	  interactions: ol.interaction.defaults().extend([new app.Drag()]),
	  layers: [
	    new ol.layer.Tile({
	      source: new ol.source.MapQuest({layer: 'sat'})
	    }),
	    new ol.layer.Vector({
	      source: new ol.source.Vector({
	        features: [pointFeature]
	      }),
	      style: new ol.style.Style({
	        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
	          scale: 0.25,
	          src: 'http://cdn.aws.chatanoo.org/mjc/nogent/divers/cercleRouge.png'
	        })),
	        stroke: new ol.style.Stroke({
	          width: 3,
	          color: [255, 0, 0, 1]
	        }),
	        fill: new ol.style.Fill({
	          color: [0, 0, 255, 0.6]
	        })
	      })
	    })
	  ],
	  target: 'map',
	  view: new ol.View({
	    center: [App.Views.appView.centerLatCarte, App.Views.appView.centerLongCarte],
	    zoom: App.Views.appView.zoomCarte
	  })
	});
}