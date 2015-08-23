$(function()
{
	/* BACKBONE */
	
	window.App = {};
	
	App.eventManager = _.extend({}, Backbone.Events);
	
	App.Models = {};
	App.Collections = {};
	App.Collections.queriesMedias = new QueriesMediasCollection();
	App.Views  = {};
	App.Router = new AppRouter();
	
	App.Views.appView = new MJCAppView();
	App.Views.appView.titreAccueil = "Conflit de Canards";
	
	// Key API
	App.Views.appView.proxy = "../core/proxy/ba-simple-proxy.php?url=";
	App.Views.appView.initAdminParams( "mazerte", "desperados", "90f1de8a-6c03-45d8-8c8a-89b10893" );

	// Carte
	App.Views.appView.mapURL = "medias/cartes/Nogent.jpg";
	App.Views.appView.largeurCarte = 1804;
	App.Views.appView.longueurCarte = 1210;
	App.Views.appView.latitudeTop = 48.850582;
	App.Views.appView.latitudeBottom = 48.823747;
	App.Views.appView.longitudeGauche = 2.452784;
	App.Views.appView.longitudeDroite = 2.513038;
	
	App.Views.appView.initAccueil();
	App.Views.appView.connectToWebServices();
	
	// Démarrage du Router
	Backbone.history.start();
	

	// XML
	/*
	$.get("xml/mjc_nogent.xml", function(xml)
	{
		var json = xmlToJson(xml);
		var queries = json.mjc.query;
		
		// console.log(JSON.stringify(json.mjc.query));

		var i, n = queries.length;
		var queryObj, queryId, querySubFolder, queryImages, queryBackgroundSound;
		var queryCarteObj, queryCarteBitmap; 
		
		var queryCarteTopLeftObj, queryCarteTopLeft, queryCarteBottomRightObj, queryCarteBottomRight;
		var queryCarteTop, queryCarteLeft, queryCarteBottom, queryCarteRight;
		
		var queryJSON;
		
		App.Collections.queriesMedias = new QueriesMediasCollection();
		
		for(i=0; i<n; i++)
		{
			queryObj = queries[i];
			
			queryId = queryObj.id;
			
			querySubFolder = queryObj.subfolder;
			queryBackgroundSound = queryObj.backgroundSound;
			queryImages = queryObj.images["#text"].split(",");
			
			queryCarteTop = null;
			queryCarteLeft = null;
			queryCarteBottom = null;
			queryCarteRight = null;
			
			queryCarteObj = queryObj.carte;
			
			if (queryCarteObj)
			{
				queryCarteBitmap = queryCarteObj.image["#text"];
				
				queryCarteTopLeftObj = queryCarteObj.topleft["#text"];
				queryCarteBottomRightObj = queryCarteObj.bottomright["#text"];
				
				
				if (queryCarteTopLeftObj)
				{
					queryCarteTopLeft = queryCarteTopLeftObj.split(" ").join("").split(",");
					queryCarteTop = queryCarteTopLeft[0];
					queryCarteLeft = queryCarteTopLeft[1];
				}
				
				if (queryCarteBottomRightObj)
				{
					queryCarteBottomRight = queryCarteBottomRightObj.split(" ").join("").split(",");
					queryCarteBottom = queryCarteBottomRight[0];
					queryCarteRight = queryCarteBottomRight[1];
				}
			}
			
			queryJSON = {	id:queryId, subfolder:querySubFolder, backgroundSound:queryBackgroundSound, 
							images:queryImages, carte:queryCarteBitmap, 
							carteTop:queryCarteTop, carteLeft:queryCarteLeft, 
							carteBottom:queryCarteBottom, carteRight:queryCarteRight
						};

			
			// On stocke les différentes données associées à chaque Query
			App.Collections.queriesMedias.add( new QueryMediasModel(queryJSON) );
			
			// console.log(App.Collections.queriesMedias.at(0));			
			// console.log(queryId, queryImages, queryCarteBitmap, queryCarteTopLeft, queryCarteBottomRight);
		}
		
		App.Views.appView.connectToWebServices();

	});	
	*/
	
});
