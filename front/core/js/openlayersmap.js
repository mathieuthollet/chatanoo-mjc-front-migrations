/* 
 * Mathieu Lot 2 
 */

/* Ouverture de la carte dans le cadre de l'ajout d'un nouveau média */
function initOpenLayersMapNewMedia() {
	
	/* Gestion Drag & drop BOF */
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
	    handleDownEvent: app.Drag.prototype.handleDownEvent,
	    handleDragEvent: app.Drag.prototype.handleDragEvent,
	    handleMoveEvent: app.Drag.prototype.handleMoveEvent,
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
	  var lonlat = ol.proj.transform(this.coordinate_, 'EPSG:3857', 'EPSG:4326');
	  App.Views.appView.mapX = lonlat[0];
	  App.Views.appView.mapY = lonlat[1];
	  //console.log(App.Views.appView.mapY, App.Views.appView.mapX);
	  this.coordinate_ = null;
	  this.feature_ = null;
	  return false;
	};
	/* Gestion Drag & drop EOF */
	
	// Création du point
	var pointFeature = new ol.Feature(new ol.geom.Point(ol.proj.transform([App.Views.appView.centerLatCarte, App.Views.appView.centerLongCarte], 'EPSG:4326', 'EPSG:3857')));

	// Rendu de la carte
	var map = new ol.Map({
	  interactions: ol.interaction.defaults().extend([new app.Drag()]),
	  layers: [
	    new ol.layer.Tile({
	      source: new ol.source.OSM({})
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
	    center: ol.proj.transform([App.Views.appView.centerLatCarte, App.Views.appView.centerLongCarte], 'EPSG:4326', 'EPSG:3857'),
	    zoom: App.Views.appView.zoomCarte
	  })
	});
}





/*****************************************************/


mapLesLieux = null;

/* Ouverture de la carte dans le cadre de la page "les lieux" */
function initOpenLayersMapLesLieux() {

	// Destruction de la cate précédente si elle existe déjà
	if (mapLesLieux != null) {
		mapLesLieux.setTarget(null);
		mapLesLieux = null;
	}

	// Liste des points
	var pointFeatures = new Array();
	var itemsCollection = App.Collections.itemsCollection;
	itemsCollection.each(function(item) {
		var cartos = item.get("cartos");
		if (cartos) {
			if (cartos.get("y") && cartos.get("x")) {
				var itemId = item.get("id");
				var motCle1 = item.get("motCle1");
				var motCle2 = item.get("motCle2");
				var motCle3 = item.get("motCle3");
				var titre = item.get("title");
				var user = item.get("user").get("pseudo");
				pointFeatures.push(
					new ol.Feature({
						geometry: new ol.geom.Point(ol.proj.transform([parseFloat(cartos.get("x")), parseFloat(cartos.get("y"))], 'EPSG:4326', 'EPSG:3857'))
						, itemId: itemId 
						, motCle1: motCle1
						, motCle2: motCle2
						, motCle3: motCle3
						, titre: titre
						, pseudo: user
					})
				);
			}
		}
	});
	
	// Rendu de la carte
	mapLesLieux = new ol.Map({
	  layers: [
	    new ol.layer.Tile({
	      source: new ol.source.OSM({})
	    })
	    , new ol.layer.Vector({
	      source: new ol.source.Vector({
	        features: pointFeatures
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
	  target: 'carte',
	  view: new ol.View({
	    center: ol.proj.transform([App.Views.appView.centerLatCarte, App.Views.appView.centerLongCarte], 'EPSG:4326', 'EPSG:3857'),
	    zoom: App.Views.appView.zoomCarte
	  })
	});

	// Clic sur les points
	mapLesLieux.on("click", function(e) {
	    mapLesLieux.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
	        alert('test');
			var v = App.eventManager;
			if (v) v.trigger("itemSelection", feature.B.itemId, null, feature.B.motCle1, feature.B.motCle2, feature.B.motCle3, feature.B.titre, feature.B.pseudo);
	    });
	});
 
 	// Change le cursor en pointer sur les points
    var target = map.getTarget();
    var jTarget = typeof target === "string" ? $("#" + target) : $(target);
    // change mouse cursor when over marker
    $(mapLesLieux.getViewport()).on('mousemove', function (e) {
        var pixel = mapLesLieux.getEventPixel(e.originalEvent);
        var hit = mapLesLieux.forEachFeatureAtPixel(pixel, function (feature, layer) {
            return true;
        });
        if (hit) {
            jTarget.css("cursor", "pointer");
        } else {
            jTarget.css("cursor", "");
        }
    });
}