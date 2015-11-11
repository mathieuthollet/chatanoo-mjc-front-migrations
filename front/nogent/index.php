<!doctype html>
<html>
<head>
	<meta charset='UTF-8'>
	<title>MJC Nogent</title>
    
	<link rel='stylesheet' href='../core/styles/mjc.css' type='text/css' />
   	<link rel='stylesheet' href='../core/mediaelement/mediaelementplayer.min.css' type='text/css' />    
	<link rel='stylesheet' href='styles/mjc_nogent.css' type='text/css' />
    
	<script src="../core/js/libs/jquery-2.1.1.min.js"></script>
	<script src="../core/js/libs/jquery.actual.min.js"></script>    
	<script src="../core/js/libs/modernizr.custom.88646.js"></script>    
    <script src="../core/js/libs/underscore-min.js"></script>
    <script src="../core/js/libs/underscore.strings.js"></script>
    <script src="../core/js/libs/backbone-min.js"></script>
    <script src="../core/js/libs/json2_min.js"></script>
    <script src="../core/js/libs/kinetic-v5.1.0.min.js"></script>
    <script src="../core/js/libs/mediaelement-and-player.min.js"></script>
    <script src="../core/js/libs/spin.min.js"></script>
    <script src="../core/js/libs/greensock/TweenMax.min.js"></script>
    <script src="../core/js/libs/greensock/utils/Draggable.min.js"></script>
    <script src="../core/js/libs/greensock/TimelineLite.min.js"></script>
    
    <script src="https://cdnjs.cloudflare.com/ajax/libs/aws-sdk/2.1.36/aws-sdk.js"></script>
    
 	<!-- Emoji --> 
	<link rel="stylesheet" href="../core/styles/jquery.emojipicker.css" type="text/css" />
	<link rel="stylesheet" href="../core/styles/jquery.emojipicker.a.css" type="text/css" />
	<script src="../core/js/libs/jquery.emojipicker.js"></script>
	<script src="../core/js/libs/jquery.emojipicker.a.js"></script>
 
</head>
<body>
	
    <?php include "../core/templates.php"  ?>

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
                                    <span class="couleur_base">Bienvenue au site de débat "Conflit de Canards" !</span>
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
                <div class="onglet questions active">Les questions</div>
                <div class="onglet items">Les opinions</div>
                <div class="onglet users">Les participants</div>
                <div class="onglet carte">Les lieux</div>
                <div class="onglet motcles">Les «tags»</div>
            </div>
            
            <div class="navigationFooter">
            	<div id="envoyer" class="envoyer">J'ai aussi mon mot à dire</div>
            </div>
            
            <div class="creativecommons">
            Dispositif mutualisé par l'association Concert-Urbain sous un contrat Creative Commons (CC BY-NC-ND 3.0 FR) 
            <img src="../core/images/cc.png" alt="" />
            </div>
            
        </div>
        
        <div class="popup borderTopRounded shadow" id="popup"></div>                  
                        
    </div>
    
	<script src="../core/js/utils.js"></script>
	<script src="../core/js/draw_mjc.js"></script>
	<script src="../core/js/models_backbone.js"></script>
	<script src="../core/js/views_backbone.js"></script>
	<script src="../core/js/views_controler_aws.js"></script>
	<script src="../core/js/views_mjc.js"></script>
	<script src="../core/js/router_backbone.js"></script>
	<script src="js/setup_nogent.js"></script>

</body>
</html>
