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
	App.Views.appView.titreAccueil = "MJC de Viry";

	// Key API
	App.Views.appView.proxy = "../core/proxy/ba-simple-proxy.php?url=";
	App.Views.appView.initAdminParams( "Clef", "Api", "27oV8cVXWs9k873wdqs2xtBPxL9YJB6r" );

	// Carte
	App.Views.appView.mapURL = "medias/cartes/Google-Viry.jpg";
	App.Views.appView.largeurCarte = 1693;
	App.Views.appView.longueurCarte = 1193;
	App.Views.appView.latitudeTop = 48.682064;
	App.Views.appView.latitudeBottom = 48.648136;
	App.Views.appView.longitudeGauche = 2.344163;
	App.Views.appView.longitudeDroite = 2.416475;
	
	App.Views.appView.initAccueil();
	App.Views.appView.connectToWebServices();
	
	// Démarrage du Router
	Backbone.history.start();

});
