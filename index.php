<?php error_reporting(0); ?>
<!doctype html>
<html>
<head>
	<meta charset='UTF-8'>
	<title><?php echo $_ENV["TITLE"] ?></title>
    
	<link rel='stylesheet' href='front/core/styles/mjc.css' type='text/css' />
   	<link rel='stylesheet' href='front/core/mediaelement/mediaelementplayer.min.css' type='text/css' />    
	<link rel="stylesheet" href="http://openlayers.org/en/v3.11.2/css/ol.css" type="text/css"><!-- Mathieu Lot 2 test -->
    
    <style>
        .global .centre .ecrans .accueil {
            background-size: cover;
        }

        .global .navigationFooter .envoyer {
            background-image:url(<?php echo $_ENV["CIRCLE_URL"] ?>);
            background-repeat:no-repeat;
            background-size:20px 20px;
            padding-left:22px;
            padding-top: 0px;
            height:25px;
        }
    </style>

    
	<script src="front/core/js/libs/jquery-2.1.1.min.js"></script>
	<script src="front/core/js/libs/jquery.actual.min.js"></script>    
	<script src="front/core/js/libs/modernizr.custom.88646.js"></script>    
    <script src="front/core/js/libs/underscore-min.js"></script>
    <script src="front/core/js/libs/underscore.strings.js"></script>
    <script src="front/core/js/libs/backbone-min.js"></script>
    <script src="front/core/js/libs/json2_min.js"></script>
    <script src="front/core/js/libs/kinetic-v5.1.0.min.js"></script>
    <script src="front/core/js/libs/mediaelement-and-player.min.js"></script>
    <script src="front/core/js/libs/spin.min.js"></script>
    <script src="front/core/js/libs/greensock/TweenMax.min.js"></script>
    <script src="front/core/js/libs/greensock/utils/Draggable.min.js"></script>
    <script src="front/core/js/libs/greensock/TimelineLite.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/aws-sdk/2.1.36/aws-sdk.js"></script>
    <script src="http://openlayers.org/en/v3.11.2/build/ol.js" type="text/javascript"></script><!-- Mathieu Lot 2 test -->
    
 	<!-- Emoji --> 
	<link rel="stylesheet" href="front/core/styles/jquery.emojipicker.css" type="text/css" />
	<link rel="stylesheet" href="front/core/styles/jquery.emojipicker.a.css" type="text/css" />
	<script src="front/core/js/libs/jquery.emojipicker.js"></script>
	<script src="front/core/js/libs/jquery.emojipicker.a.js"></script>
 
</head>
<body>
	
    <?php include "front/core/templates.php"  ?>

	<!--  -->
	<!-- HTML -->
	<!--  -->

	<div class="global">
    
        <div class="header">
        
            <div class="titre couleur_base"><p>Titre</p></div>
            
            <div class="haut">
                <div class="terme couleur_base utopique"><p>utopique</p></div>
            </div>
            
        </div>
        
        <div class="container">
            
            <div class="milieu">
            
                <div class="gauche">
                    <div class="terme couleur_base individuel"><p>individuel</p></div>
                </div>
                
                <div class="centre">
                
                    <div class="ecrans">
                    
                        <div class="accueil">
                        
                            <div class="projets borderTopRounded shadow">
                                <div class="header borderTopRounded">
                                    <div class="close">x</div>
                                </div>
                                <div class="introduction">
                                    <span class="couleur_base">Bienvenue au site de débat "<?php echo $_ENV["TITLE"] ?>" !</span>
                                    Choisissez une question, écoutez ce que chacun en dit, participez en envoyant une vidéo, un texte
                                    ou un enregistrement sonore. Vous pourrez voir qui a participé, où et quels mots-clés structurent le débat.
                                </div>
                                <div class="liste" id="queries"></div>
                            </div>
                        </div>
                        
                        <div class="mosaique" id="mosaique">
                            <div class="mosaiqueModes">
                                <div class="vue items" id="items"></div>
                                <div class="vue users" id="users"></div>
                                <div class="vue carte" id="carte"></div>
                                <div class="vue motcles" id="motcles"></div>
                            </div>
                        </div>
                        
                        
                        <div class="indices" id="indices"></div>                    
                        <div class="uploadParent borderTopRounded shadow"></div>
                        <div class="animationAttente" id="attente"></div>                    
                    </div>
                    
                </div>
                
                <div class="droite">
                    <div class="terme couleur_base collectif"><p>collectif</p></div>
                </div>
                
                <div class="clear"></div>
            </div>
            
            
        </div>
        
        <div class="footer">
        
            <div class="bas">
                <div class="terme couleur_base realiste"><p>réaliste</p></div>
            </div>
            
        	<div class="tabs">
                <div class="onglet questions active"><!--Les questions-->&lt;&nbsp;&nbsp;&nbsp; Autre question<!--Mathieu Thollet Lot 1 bis--></div>
                <div class="onglet motadire" id="envoyer">J'ai aussi mon mot à dire</div><!--Mathieu Thollet Lot 1 bis-->
                <div class="onglet items">Les opinions</div>
                <div class="onglet users">Les participants</div>
                <div class="onglet carte">Les lieux</div>
                <div class="onglet motcles">Les «tags»</div>
            </div>
            
            <!--<div class="navigationFooter">
            	<div id="envoyer" class="envoyer">J'ai aussi mon mot à dire</div>
            </div>--><!--Mathieu Thollet Lot 1 bis-->
            
            <div class="creativecommons">
            Dispositif mutualisé par l'association Concert-Urbain sous un contrat Creative Commons (CC BY-NC-ND 3.0 FR) 
            <img src="front/core/images/cc.png" alt="" />
            </div>
            
        </div>
        
        <div class="popup borderTopRounded shadow" id="popup"></div>                  
                        
    </div>
    
	<script src="front/core/js/utils.js"></script>
	<script src="front/core/js/draw_mjc.js"></script>
	<script src="front/core/js/models_backbone.js"></script>
	<script src="front/core/js/views_backbone.js"></script>
	<script src="front/core/js/views_controler_aws.js"></script>
	<script src="front/core/js/views_mjc.js"></script>
	<script src="front/core/js/router_backbone.js"></script>

    <script>

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
            App.Views.appView.serviceURL = "<?php echo $_ENV["SERVICE_URL"] ?>/services";
            App.Views.appView.mediaCenterURL = "<?php echo $_ENV["MEDIAS_CENTER_URL"] ?>";
            App.Views.appView.titreAccueil = "<?php echo $_ENV["TITLE"] ?>";
            App.Views.appView.queriesPrefix = "<?php echo $_ENV["QUERIES_PREFIX"] ?>";
            App.Views.appView.imageAccueil = "<?php echo $_ENV["IMAGE_ACCUEIL_URL"] ?>";

            // Key API
            App.Views.appView.proxy = "front/core/proxy/ba-simple-proxy.php?url=";
            App.Views.appView.initAdminParams( 
                "<?php echo $_ENV["USER"] ?>", 
                "<?php echo $_ENV["PASS"] ?>", 
                "<?php echo $_ENV["API_KEY"] ?>" 
            );

            // Carte
            App.Views.appView.mapURL = "<?php echo $_ENV["MAP_URL"] ?>";
            App.Views.appView.largeurCarte = <?php echo( array_key_exists("MAP_WIDTH", $_ENV) ? $_ENV["MAP_WIDTH"] : 1804 ); ?>;
            App.Views.appView.longueurCarte = <?php echo( array_key_exists("MAP_HEIGHT", $_ENV) ? $_ENV["MAP_HEIGHT"] : 1210 ); ?>;
            App.Views.appView.latitudeTop = <?php echo( array_key_exists("MAP_LAT_TOP", $_ENV) ? $_ENV["MAP_LAT_TOP"] : 48.850582 ); ?>;
            App.Views.appView.latitudeBottom = <?php echo( array_key_exists("MAP_LAT_BOTTOM", $_ENV) ? $_ENV["MAP_LAT_BOTTOM"] : 48.823747 ); ?>;
            App.Views.appView.longitudeGauche = <?php echo( array_key_exists("MAP_LON_TOP", $_ENV) ? $_ENV["MAP_LON_TOP"] : 2.452784 ); ?>;
            App.Views.appView.longitudeDroite = <?php echo( array_key_exists("MAP_LON_BOTTOM", $_ENV) ? $_ENV["MAP_LON_BOTTOM"] : 2.513038 ); ?>;
            
            App.Views.appView.initAccueil();
            App.Views.appView.connectToWebServices();
            
            // Démarrage du Router
            Backbone.history.start();
        })

    </script>

</body>
</html>
