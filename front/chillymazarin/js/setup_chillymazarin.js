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
	App.Views.appView.titreAccueil = "MJC de Chilly-Mazarin";

	// Key API
	App.Views.appView.proxy = "../core/proxy/ba-simple-proxy.php?url=";
	App.Views.appView.initAdminParams( "Clef", "Api", "yC6bR4z3Um3erX93WVgce28Z2RPncQ6v" );

	// Carte
	App.Views.appView.mapURL = "medias/cartes/Google-Chilly.jpg";
	App.Views.appView.largeurCarte = 1635;
	App.Views.appView.longueurCarte = 1198;
	App.Views.appView.latitudeTop = 48.720994;
	App.Views.appView.latitudeBottom = 48.689501;
	App.Views.appView.longitudeGauche = 2.284393;
	App.Views.appView.longitudeDroite = 2.345204;
	
	App.Views.appView.initAccueil();
	App.Views.appView.connectToWebServices();
	
	// Démarrage du Router
	Backbone.history.start();

});
