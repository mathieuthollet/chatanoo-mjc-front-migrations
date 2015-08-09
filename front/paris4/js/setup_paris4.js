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
	App.Views.appView.titreAccueil = "MJC de Paris 4";

	// Key API
	App.Views.appView.proxy = "../core/proxy/ba-simple-proxy.php?url=";
	App.Views.appView.initAdminParams( "Clef", "Api", "xHB4fmJt67BcEf979QRQh3RYmh7W7p9g" );

	// Carte
	App.Views.appView.mapURL = "medias/cartes/Google-Paris4.jpg";
	App.Views.appView.largeurCarte = 1625;
	App.Views.appView.longueurCarte = 1229;
	App.Views.appView.latitudeTop = 48.862664;
	App.Views.appView.latitudeBottom = 48.845496;
	App.Views.appView.longitudeGauche = 2.342462;
	App.Views.appView.longitudeDroite = 2.377094;
	
	App.Views.appView.initAccueil();
	App.Views.appView.connectToWebServices();
	
	// Démarrage du Router
	Backbone.history.start();

});
