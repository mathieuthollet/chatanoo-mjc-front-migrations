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
	App.Views.appView.titreAccueil = "MJC de Bonneuil";

	// Key API
	App.Views.appView.proxy = "../core/proxy/ba-simple-proxy.php?url=";
	App.Views.appView.initAdminParams( "Clef", "Api", "a29zu8b4gJq24sj2xcfW8ZzkgvuD9E8K" );

	// Carte
	App.Views.appView.mapURL = "medias/cartes/Google-Bonneuil .jpg";
	App.Views.appView.largeurCarte = 1413;
	App.Views.appView.longueurCarte = 1088;
	App.Views.appView.latitudeTop = 48.792177;
	App.Views.appView.latitudeBottom = 48.761973;
	App.Views.appView.longitudeGauche = 2.455499;
	App.Views.appView.longitudeDroite = 2.515795;
	
	App.Views.appView.initAccueil();
	App.Views.appView.connectToWebServices();
	
	// Démarrage du Router
	Backbone.history.start();

});
