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
	App.Views.appView.titreAccueil = "MJC de Nanterre";

	// Key API
	App.Views.appView.proxy = "../core/proxy/ba-simple-proxy.php?url=";
	App.Views.appView.initAdminParams( "Clef", "Api", "Ansch8Xk72j63BPx23GwDa6GwAE66joH" );

	// Carte
	App.Views.appView.mapURL = "medias/cartes/Google-Nanterre.jpg";
	App.Views.appView.largeurCarte = 1712;
	App.Views.appView.longueurCarte = 1122;
	App.Views.appView.latitudeTop = 48.908710;
	App.Views.appView.latitudeBottom = 48.880410;
	App.Views.appView.longitudeGauche = 2.174516;
	App.Views.appView.longitudeDroite = 2.241250;
	
	App.Views.appView.initAccueil();
	App.Views.appView.connectToWebServices();
	
	// Démarrage du Router
	Backbone.history.start();

});
