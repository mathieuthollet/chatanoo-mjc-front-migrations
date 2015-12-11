
//
// Contrôleur de l'application
//

var AppView = Backbone.View.extend({

	authentificationID: null,
	awsURL: "http://medias.aws.chatanoo.org/",  // "https://s3-eu-west-1.amazonaws.com/";

	accueilElement: $(".global .centre .accueil"),
	mosaiqueElement: $(".global .centre .mosaique"),
	
	initialize: function () {
		
		this.proxy = "proxy/ba-simple-proxy.php?url=";
		this.serviceURL = "http://core.aws.chatanoo.org/services";
		this.uploadURL = "http://ms.dring93.org/upload";
		this.mediaCenterURL = "http://medias.aws.chatanoo.org";
		this.mapURL = "medias/cartes/CARTE_DRING13.jpg";
		this.queriesPrefix = "";
		
		this.initAdminParams( "mazerte", "desperados", "90f1de8a-6c03-45d8-8c8a-89b10893" );
		
		this.axeHorizontal = { gauche:"individuel.", droite:"collectif." };
		this.axeVertical   = { bas:"réaliste.", haut:"utopique." };

		$.event.special.removed = {
			remove: function(o) {
				if (o.handler) {
					o.handler()
				}
			}
		}
	},
	
	initAdminParams: function( u1 , u2, u3 ) {
		this.adminParams = [ u1, u2, u3 ];
		this.keyApi = u3;
	},


	// --------------------------------------------------
	//
	// Mosaïque
	//
	// --------------------------------------------------

	initAccueil: function () {
		
		var t = this;
		
		// Titre de l'accueil :
		if (t.titreAccueil) $(".global .header .titre p").text( t.titreAccueil );
		
		// Support du Canvas ?
		if (Modernizr.canvas && Modernizr.csstransforms) {
			// Le navigateur supporte le canvas et les css-transforms
		} else {
			
			// Animation du footer :
			// Succession du message par défaut Creative Commons et de celui de la mise à jour du navigateur
			
			var ccElement = $(".creativecommons");
			
			// Texte par défaut
			var creativeCommonsHtml = ccElement.html();
			
			// Texte alternatif
			var browserHtml =  "<strong>Attention, votre navigateur est trop ancien. Mettez le à jour ou utilisez un navigateur récent.</strong>";
			
			var tl, restart = function() { tl.restart(); };
			
			tl = new TimelineLite( { onComplete:restart });
			tl.to(ccElement, 1, { opacity: 0, delay: 3 });
			tl.call( function() { ccElement.html( browserHtml ); });
			tl.to(ccElement, 1, { opacity: 1 });
			tl.to(ccElement, 1, { opacity: 0, delay: 3 });
			tl.call( function() { ccElement.html( creativeCommonsHtml ); });
			tl.to(ccElement, 1, { opacity: 1 });
			tl.play();
		}
	},


	//
	// Webs Services
	//
		
	connectToWebServices: function () {
		
		var t = this;
		var v = App.eventManager;
		
		// Authentification au WebServices
		t.authentification();	
		
		// ... déclenchera le téléchargement de la liste des projets
		v.on("authentificationSuccess", this.fetchProjects, this);
		
		v.on("itemSelection", this.openMediaItem, this);
		v.on("itemRollOver", this.openTooltipItem, this);
		v.on("itemRollOut", this.closeTooltipItem, this);
		
		// Dessin de l'évolution de la moyenne des votes
		v.on("itemDrawEvolution", this.drawEvolutionVote, this);
		v.on("itemClearEvolution", this.clearEvolutionVote, this);
		
		v.on("voteMedia", this.voteMediaItem, this);

		v.on("closePopUpWithCloseButton", this.closePopUpWithCloseButton, this);
	},
	
	authentification: function( params, callback ) {
		
		var t = this;
		var v = App.eventManager;
		
		var jsonInput = {
			"id" : t.generateID(),
			"method" : "login",
			"params" : params || t.adminParams
		};
		
		var success = function(jsonResult) {
			
			t.authentificationID = jsonResult;
			
			if (callback)
			{
				callback();
			}
			else
			{
				v.trigger("authentificationSuccess");
			}
		};
		
		t.ajax("connection", jsonInput, success);
	},
		
	fetchProjects: function() {
		
		var t = this;
		
		var jsonInput = {
			"id" : t.generateID(),
			"method" : "getQueries",
			"params" : []
		};
		
		var success = function(jsonResult) {

			// console.log("queries", App.Views.QueriesView.collection.length);

			//
			// Création de la liste des projets (Queries) sur la page d'accueil
			//

			jsonResult = _(jsonResult).filter(function (query) {
				return query.content.indexOf(t.queriesPrefix) == 0;
			});
			App.Views.QueriesView = new Chatanoo.QueriesView(jsonResult);


			// 
			// Chargement des metas données du projet (pour l'image de fond de l'accueil)
			//

			var backgroundAccueilImageID = App.Views.appView.imageAccueil;
			if ((backgroundAccueilImageID && backgroundAccueilImageID.length > 0)) {
				t.loadBackgroundImageAccueil(backgroundAccueilImageID);
			}
			else
			{
				t.fetchMetas();
			}
		};
		
		t.ajax("queries", jsonInput, success);
	},

	fetchMetas: function() {
		
		var t = this;
		
		var jsonInput = {
			"id" : t.generateID(),
			"method" : "getMetas",
			"params" : []
		};
		
		var success = function(jsonResult) {
			
			// console.log("metas", jsonResult);

			// A-t-on défini une image de fond pour l'accueil du projet ?
			var i, n = jsonResult.length, metaVO;
			for(i=0; i<n; i++)
			{
				metaVO = jsonResult[i];

				if (metaVO.name === "BACKGROUND_IMAGE_ACCUEIL") {
					t.loadBackgroundImageAccueil(metaVO.content);
					break;
				}
			}
		};
		
		t.ajax("search", jsonInput, success);
	},

	loadBackgroundImageAccueil: function(imageID) {
		var t = this;
		var backgroundImageURL = t.getImagePath(imageID);
		$(".global .container .ecrans .accueil").css("background-image", "url('" + backgroundImageURL + "')");
	},

	loadQuery: function(queryId) {
		
		var t = this;
		t.currentQuery = queryId;
		
		// Chargement des données
		t.loadDatasOfQuery(queryId);
	},
	
	loadDatasOfQuery: function(queryId) {
		
		var t = this;
		
		// On masque l'accueil et on affiche la mosaique
		t.accueilElement.css("display", "none");
		t.mosaiqueElement.css("display", "block");
		
		// Données de la query (carto)
		t.fetchDatasOfQuery(queryId);
	},

	fetchDatasOfQuery: function(queryId) {
		
		var t = this;
		
		var jsonInput = {
			"id" : t.generateID(),
			"method" : "getDatasByQueryId",
			"params" : [queryId]
		};
		
		var success = function(jsonResult) {
			
			// console.log("datas", jsonResult.length);
			
			// ... puis des méta-données de la  de la query (mots-clés)
			t.fetchMetasOfQuery(queryId);
		};
		
		t.ajax("datas", jsonInput, success)
	},
		
	fetchMetasOfQuery: function(queryId, success) {
		
		var t = this;
		
		var jsonInput = {
			"id" : t.generateID(),
			"method" : "getMetasByVo",
			"params" : [queryId,"Query"]
		};
		
		var success = success || function(jsonResult) {
			
			// console.log("metas", jsonResult.length);
			
			//
			var i, n = jsonResult.length, jsonItem;
			
			// Liste des mots-clés de la question en cours
			App.Collections.keyWord = new MetaCollection();
			
			for(i=0; i<n; i++)
			{
				jsonItem = jsonResult[i];
				
				switch(jsonItem.name)
				{
					case "KeyWord":
					App.Collections.keyWord.add( new MetaModel(jsonItem) );
					break;
					
					case "MapZoom":
					App.Views.appView.zoomCarte = jsonItem.content;	// Mathieu Lot 2
					App.Views.appView.centerLatCarte = 12.303;	// Mathieu Lot 2 TODO rendre dynamique quand on pourra récupérer le meta
					App.Views.appView.centerLongCarte = 42.940;	// Mathieu Lot 2 TODO rendre dynamique quand on pourra récupérer le meta
					break;
					
					case "MapType":
					break;
					
					case "BACKGROUND_IMAGE":
					case "CARTE_LONGITUDE_MIN":
					case "CARTE_LONGITUDE_MAX":
					case "CARTE_LATITUDE_MIN":
					case "CARTE_LATITUDE_MAX":
					break;
				}
			}
	
			// console.log("keyWord", App.Collections.keyWord.length);

			// ... et enfin des items de la  de la query
			t.fetchItemsOfQuery(queryId);
		};
		
		t.ajax("search", jsonInput, success);
	},

	fetchItemsOfQuery: function(queryId) {
		
		var t = this;
		
		var jsonInput = {
			"id" : t.generateID(),
			"method" : "call",
			"params" : ["GetItemsWithDetailsByQuery", [queryId]]
		};
		
		var success = function(jsonResult) {
			
			var keyWords = App.Collections.keyWord.getContents();
			
			// TODO : Stocker les collections d'items des différentes Query pour ne pas les recharger
			var itemsCollection = App.Collections.itemsCollection = new ItemsCollection();
			
			var i, n = jsonResult.length, jsonItem;
			var jsonItemVO, jsonItemUser, jsonItemCartos, jsonItemVotes, jsonItemComments, jsonItemMedias;
			var jsonItemMetas, jsonItemRate;
			
			var centreEl = $(".centre");
			var centreWidth  = centreEl.width();
			var centreHeight = centreEl.height();
			
			// console.log("fetchItemsOfQuery", n);
			
			for(i=0; i<n; i++)
			{
				jsonItem = jsonResult[i];
				
				jsonItemVO = jsonItem.VO;
					
				// console.log(jsonItem);
					
				if (jsonItemVO._isValid != false)
				{
					jsonItemUser = jsonItem.user;
					jsonItemCartos = jsonItem.datas.Carto[0];
					jsonItemVotes = jsonItem.datas.Vote;
					jsonItemMetas = jsonItem.metas;
					jsonItemRate = jsonItem.rate;
					
					// console.log(jsonItemVotes);
					
					var user = new UserModel(jsonItemUser);
					
					var cartos = new DataCartoModel(jsonItemCartos);
					
					var votes = new DataVoteCollection(jsonItemVotes);
					votes.comparator = 'page';
					
					var metas = new MetaCollection(jsonItemMetas);
					metas.comparator = 'name';
					
					var itemModel = new ItemModel(jsonItemVO);
					itemModel.set("rate"  , jsonItemRate);
					itemModel.set("user"  , user);
					itemModel.set("cartos", cartos);
					itemModel.set("votes" , votes);
					itemModel.set("metas" , metas);
					

					itemModel.analyseMetaKeywords();
					
					itemsCollection.add ( itemModel ); 
				}
			}
			
			t.buildView();
		};
		
		t.ajax("plugins", jsonInput, success);
	},

	buildView: function() {
	
		var itemsCollection = App.Collections.itemsCollection;
	
		//
		// Création de la liste des projets (Items) sur la mosaïque
		//
		
		App.Views.MosaiqueItemsView = new Chatanoo.MosaiqueItemsView(itemsCollection);	
	},
		
	fetchMediaOfItem: function(itemId, success) {
		
		var t = this;
		
		var jsonInput = {
			"id" : t.generateID(),
			"method" : "getMediasByItemId",
			"params" : [itemId]
		};
		
		var success = success || function(jsonResult) {
			// console.log(jsonResult);
		};
		
		t.ajax("medias", jsonInput, success);
	},


	/* Commentaires des items */
	
	fetchCommentsOfItem: function(itemId, success) {

		console.log("fetchCommentsOfItem", itemId);

		var t = this;
		
		var jsonInput = {
			"id" : t.generateID(),
			"method" : "getCommentsByItemId",
			"params" : [itemId]
		};
		
		var success = success || function(jsonResult) {
			// console.log(jsonResult);
		};
		
		t.ajax("comments", jsonInput, success);
	},
	
	fetchDataOfCommentOfItem: function(commentId, itemId, success) {

		var t = this;
		
		var jsonInput = {
			"id" : t.generateID(),
			"method" : "getDatasByCommentId",
			"params" : [commentId, itemId]
		};
		
		var success = success || function(jsonResult) {
			// console.log(jsonResult);
		};
		
		t.ajax("datas", jsonInput, success);
		
	},

	addCommentToItem: function(itemId, commentModel, vote, success) {

		console.log("addCommentToItem", itemId, "->", commentModel);

		// JSON ou model BackBoneJS ?
		var commentJSON = commentModel.toJSON ? commentModel.toJSON() : commentModel;

		var t = this;
		
		var jsonInput = {
			"id" : t.generateID(),
			"method" : "addCommentIntoItem",
			"params" : [ commentJSON, parseInt(itemId), vote]
		};
		
		var success = success || function(jsonResult) {
			// console.log(jsonResult);
		};
		
		t.ajax("items", jsonInput, success);
		
	},

	addVoteToComment: function(voteModel, commentId, voteValue, itemId, success) {

		// JSON ou model BackBoneJS ?
		var voteJSON = voteModel.toJSON ? voteModel.toJSON() : voteModel;
		
		var t = this;
		
		var jsonInput = {
			"id" : t.generateID(),
			"method" : "addDataIntoVo",
			"params" : [ voteJSON, parseInt(commentId), voteValue, parseInt(itemId)]
		};
		
		var success = success || function(jsonResult) {
			// console.log(jsonResult);
		};
		
		t.ajax("comments", jsonInput, success);
		
	},

	getRateOfToItem: function(itemId, success) {

		var t = this;
		
		var jsonInput = {
			"id" : t.generateID(),
			"method" : "getRateOfItem",
			"params" : [ itemId ]
		};
		
		var success = success || function(jsonResult) {
			// console.log(jsonResult);
		};
		
		t.ajax("items", jsonInput, success);
		
	},	


	/* Titres des items (affichés en rollOver) */

	openTooltipItem: function(itemId, titre, user, position) {
		
		if ((titre == "") || (titre == null)) titre = "(Sans titre)";
		
		var parentToolTip = $(".global");
		var userSpan = user.length == 0 ? "" : " <span class='username'>par " + user + "</span>";
		parentToolTip.append("<div class='tooltip shadow'>" + titre + userSpan + "</div>");
		
		var tooltipEl = $(".tooltip", parentToolTip);
		tooltipEl.css("position", "absolute");
		tooltipEl.css("left", position.left + "px");
		tooltipEl.css("top", (position.top + 25) + "px");
		
	},
	
	closeTooltipItem: function(itemId, titre, user, position) {
		var parentToolTip = $(".global");
		var tooltipEl = $(".tooltip", parentToolTip);
		tooltipEl.remove();
	},
	
	
	
	/* MediaPlayer */
	
	openMediaItem: function(itemId, motCle, motCle1, motCle2, motCle3, titre, pseudo) {

		console.log("[CONTROLER AWS] openMediaItem itemId = ", itemId); // , motCle, motCle1, motCle2, motCle3, titre, pseudo);

		var popupView = this.prepareMediaPlayer();

		this.openMediaItemInPlayer(popupView, itemId, motCle, motCle1, motCle2, motCle3, titre, pseudo);
	},
	
	prepareMediaPlayer: function( playerWidth, playerHeight, playerX, playerY ) {
			
		var t = this;
		
		// TODO On affiche la popUp avec un Gif de chargement
		
		var popUpElement = $("#popup");
		popUpElement.css("display", "block");
		
		if (playerX) popUpElement.css("left", playerX + "px");
		if (playerY) popUpElement.css("top", playerY + "px");
		
		// Taille de la popUp
		var popUpReference = $("#mosaique");
		var popUpWidth = playerWidth || popUpReference.width();
		var popUpHeight = playerHeight || popUpReference.height();

		var options =  {
			
			width:popUpWidth, height:popUpHeight, 
			gauche: t.axeHorizontal.gauche,
			droite: t.axeHorizontal.droite,
			bas: t.axeVertical.bas,
			haut: t.axeVertical.haut
		};

		var popUp = new Chatanoo.PopUpView( { el : popUpElement } ).render( options );

		// TODO : remplacer le passage par l'eventManager
		// popUp.on("voteMedia", this.voteMediaItem, this);

		var mediaWidth = Math.floor(popUpWidth * 0.5);
		var mediaHeight = Math.floor(popUpHeight * 0.5);
		
		popUp.mediaWidth = mediaWidth;
		popUp.mediaHeight = mediaHeight;
		
		var popUpContentMedia = $(".popupMedia", popUpElement);
		popUpContentMedia.css("width", mediaWidth + "px");
		popUpContentMedia.css("height", mediaHeight + "px");

		// popUpContentMedia.css("margin-left", (popUpWidth * 0.05) + "px");
		// popUpContentMedia.css("margin-top", (popUpHeight * 0.05) + "px");
		
		var popUpSliders = $(".popupSliders", popUpElement);
		popUpSliders.css("top", (mediaHeight + 50) + "px");

		return popUp;
	},

	getImageKey: function( imageID ) {
		return imageID + "/image.png";
	},

	getImagePath: function( imageID ) {
		if (imageID.indexOf('http') == 0) {
			return imageID;
		} else if(imageID.indexOf('-P') !== -1) {
			return this.awsURL + imageID + ".jpg";
		} else {
			return this.awsURL + this.getImageKey(imageID);
		}
	},

	createImageView: function( element, itemId, mediaId, imageID ) {
		var t = this;
		var mediaPath = t.getImagePath(imageID);
		var model = new MediaModel( { itemId: itemId, id: mediaId, url: mediaPath } );
		var imageView = new Chatanoo.ImageView( { el: element, model: model } ).render();

		return { model:model, view:imageView };
	},

	getVideoKey: function( videoID ) {
		return videoID + "/video.mp4";
	},

	createVideoView: function( element, itemId, mediaId, videoID, width, height) {

		console.log("createVideoView");

		var t = this;

		var extension = ".mp4";
		var mime = "video/mp4";
		var mediaPath = t.awsURL + t.getVideoKey(videoID);

		var model = new MediaModel( { itemId: itemId, id: mediaId, url: mediaPath, mime:mime, width:width, height:height, autoplay: true } );
		var videoView = new Chatanoo.VideoView( { el: element, model: model } ).loadVideo();

		return { model:model, view:videoView };
	},

	getAudioKey: function( audioID ) {
		return audioID + "/audio.mp3";
	},

	createAudioView: function( element, itemId, mediaId, audioID) {
		var t = this;

		var extension = ".mp3";
		var mime = "audio/mp3";
		var mediaPath = this.awsURL + t.getAudioKey(audioID);

		var model = new MediaModel( { itemId: itemId, id: mediaId, url: mediaPath, mime:mime, autoplay: true } );
		var audioView = new Chatanoo.AudioView( { el: element, model: model } ).loadAudio();

		return { model:model, view:audioView };
	},
	
	createTextView: function( element, itemId, mediaId, textContent) {
		var t = this;
		
		var model = new TextMediaModel( { itemId: itemId, id: mediaId, content: textContent } );
		var textView = new Chatanoo.TextMediaView( { el: element, model: model } ).render();
		
		return { model:model, view:textView };
	},
	
	openMediaItemInPlayer: function( popupView, itemId, motCle, motCle1, motCle2, motCle3, titre, pseudo) {

		console.log("openMediaItemInPlayer", itemId);

		var t = this;

		if (t.mediaViewAndModel && t.mediaViewAndModel.view) {
			t.mediaViewAndModel.view.close();
			t.mediaViewAndModel = null;
		}

		var popUpElement = popupView.$el;
		var mediaTitle = $(".popupTitle", popUpElement);
		var mediaParent = $(".popupMedia", popUpElement);
		var mediaWidth = popupView.mediaWidth;
		var mediaHeight = popupView.mediaHeight;
		
		if ((titre == "") || (titre == null)) titre = "(Sans titre)";
		
		mediaTitle.html(titre + "<br/><span class='username'>par " + pseudo + "</span>");
		
		var success = function(jsonResult) {

			console.log("openMediaItemInPlayer success", itemId);

			if (jsonResult.Picture && (jsonResult.Picture.length > 0))
			{
				var imageObject = jsonResult.Picture[0];
				var imageId = imageObject.id;
				var titreImage = imageObject.title;
				var urlImage = imageObject.url;
				
				console.log("media", imageId, titreImage, urlImage);

				t.mediaViewAndModel = t.createImageView( mediaParent, itemId, imageId, urlImage );

				popupView.model = t.mediaViewAndModel.model;
			}
			else if (jsonResult.Video && (jsonResult.Video.length > 0))
			{
				var videoObject = jsonResult.Video[0];
				var videoId = videoObject.id;
				var titreVideo = videoObject.title;
				var urlVideo = videoObject.url;
				
				console.log("media", videoId, titreVideo, urlVideo);

				t.mediaViewAndModel = t.createVideoView( mediaParent, itemId, videoId, urlVideo, mediaWidth, mediaHeight );
				
				popupView.model = t.mediaViewAndModel.model;
			}
			else if (jsonResult.Sound && (jsonResult.Sound.length > 0))
			{
				var audioObject = jsonResult.Sound[0];
				var audioId = audioObject.id;
				var titreAudio = audioObject.title;
				var urlAudio = audioObject.url;
				
				console.log("media", audioId, titreAudio, urlAudio);

				t.mediaViewAndModel = t.createAudioView( mediaParent, itemId, audioId, urlAudio );

				popupView.model = t.mediaViewAndModel.model;
			}
			else if (jsonResult.Text && (jsonResult.Text.length > 0))
			{
				// console.log("openMediaItem : Text --> TODO : div texte ", jsonResult );
				var textObject = jsonResult.Text[0];
				var textId = textObject.id;
				var textContent = textObject.content;

				t.mediaViewAndModel = t.createTextView( mediaParent, itemId, textId, textContent );
				
				popupView.model = t.mediaViewAndModel.model;
			}
			else
			{
				// console.log("openMediaItem : type non prévu", jsonResult );
			}


			// Drag and drop de la popUp
			
			var popUpHeader = $(".popupHeader", popUpElement);

			var onDragEnd = function(e) {
				var itemDragged = e.currentTarget;
				var draggableObject = Draggable.get(itemDragged);
			};
				
			Draggable.create(popUpElement,{ type:"x,y", trigger:popUpHeader, onDragEnd:onDragEnd });			
		};
		
		t.fetchMediaOfItem(itemId, success);
	},


	/* Vote */

	voteMediaItem: function(itemId, voteIc, voteRu) {
		
		var t = this;
		var rate = t.getRate(voteIc, voteRu);
		
		console.log("[CONTROLER AWS] voteMediaItem > vote", itemId, "ic", voteIc, "ru", voteRu, "rate", rate, "check vote = ", t.getVoteFromRate(rate));
		
		var success = function(jsonResult) {
			
			// On veut récupérer les données du vote créées côté serveur (id, dates)
			var voteId = jsonResult;
			
			var getDataVoteByIdSuccess = function(jsonResult) {
				
				var itemCollection = App.Views.MosaiqueItemsView.collection;
				var itemModel = itemCollection.findWhere( {id:itemId });
				if (itemModel)
				{
					// Nouveau vote (données récupérées par "getDataVoteById")
					var newVote = new DataVoteModel( jsonResult );
					
					// On doit ajouter ce vote à la collection des votes de cet item
					var votesCollection = itemModel.get("votes");
					
					// Position actuelle (avant le vote)
					var positions = itemModel.get("positionsMoyenneVotes");
					var lastPosition = positions[positions.length - 1];
					
					// console.log("AVANT", votesCollection.length, positions.length, "position", lastPosition.x, lastPosition.y);
					
					// Ajout du nouveau vote
					votesCollection.add(newVote);
					
					// On doit mettre à jour la nouvelle position de l'item sur la mosaique
					var mosaique = $("#mosaique");
					var mosaiqueWidth  = mosaique.width();
					var mosaiqueHeight = mosaique.height();
					
					itemModel.computeRateFromVotes(mosaiqueWidth, mosaiqueHeight);
					
					// Position nouvelle (après le vote)
					var positions = itemModel.get("positionsMoyenneVotes");
					var lastPosition = positions[positions.length - 1];
					
					// console.log("APRES", votesCollection.length, positions.length, "position", lastPosition.x, lastPosition.y);
					
					// Déplacement de l'icône sur la mosaïque
					var itemIcon = itemModel.get("icon");
					if (itemIcon) itemIcon.move( { x: lastPosition.x, y: lastPosition.y } );
				}
				else
				{
					// console.log("item non trouvé");
				}
			};
			
			t.getDataVoteById(voteId, getDataVoteByIdSuccess);
			
		};
		
		t.addDataVoteToItem(itemId, rate, success);
	},

	addDataVoteToItem: function(itemId, rate, success) {
		
		var t = this;

		console.log("addDataVoteToItem",itemId, rate);
		
		var userId = t.currentUserId ? t.currentUserId : 0;
		var dataVo = {"users_id":userId, "rate":rate, "__className":"Vo_Data_Vote", "id":0, "setDate":null, "addDate":null};
		
		var jsonInput = {
			"id" : t.generateID(),
			"method" : "addDataIntoVo",
			"params" : [dataVo, itemId]
		};
		
		var success = success || function(jsonResult) {
			// console.log(jsonResult);
		};
		
		//t.ajax("items", jsonInput, success);	// Mathieu Lot 2
	},

	getDataVoteById: function(voteId, success) {
		
		var t = this;
		
		var jsonInput = {
			"id" : t.generateID(),
			"method" : "getDatasById",
			"params" : [voteId, "Vote"]
		};
		
		var success = success || function(jsonResult) {
			// console.log(jsonResult);
		};
		
		t.ajax("datas", jsonInput, success);
	},

	addItemIntoQuery: function(queryId, mediaTitle, mediaFilename, success) {
		
		var t = this;
		
		var userId = t.currentUserId ? t.currentUserId : 0;
		var itemVO = {"users_id":userId, "title": mediaTitle, "rate":0, "__className":"Vo_Item", "isValid":true, "id":0, "rate":0, "description":"", "setDate":null, "addDate":null};
		var mediaVO = {"title": mediaTitle, "fileName": mediaFilename};
		
		var jsonInput = {
			"id" : t.generateID(),
			"method" : "addItemIntoQuery",
			"params" : [itemVO, queryId, mediaVO]
		};
		
		var success = success || function(jsonResult) {
			// Retourne l'id de l'item ajouté
			// console.log(jsonResult);
		};
		
		t.ajax("queries", jsonInput, success);
	},

	addMediaIntoItem: function(itemId, mediaTitle, mediaFilename, textMediaContent, success) {
		
		var t = this;
		var userId = t.currentUserId ? t.currentUserId : 0;
		var mediaVO;
		
		if (textMediaContent != null)
		{
			// a. Envoi d'un témoignage texte		
			mediaVO = {"users_id":userId, "content":textMediaContent, "title":mediaTitle, "__className":"Vo_Media_Text", "isValid":true, "id":0, "description":null, "setDate":null, "addDate":null};
		}
		else
		{
			// b. Envoi d'un témoignage media (image, vidéo, audio)
			var mediaArray = mediaFilename.split("-");
			var mediaType = mediaFilename.charAt(0);

			switch(mediaType)
			{
				case "P":
				mediaVO = {"users_id":userId, "url":mediaFilename, "title":mediaTitle, "__className":"Vo_Media_Picture", "isValid":true, "id":0, "preview":null, "width":null,"height":null, "description":null, "setDate":null, "addDate":null};
				break;
				
				case "M":
				mediaVO = {"users_id":userId, "url":mediaFilename, "title":mediaTitle, "__className":"Vo_Media_Video", "isValid":true, "id":0, "preview":null, "width":null,"height":null, "description":null, "setDate":null, "addDate":null};
				break;
				
				case "A":
				mediaVO = {"users_id":userId, "url":mediaFilename, "title":mediaTitle, "__className":"Vo_Media_Sound", "isValid":true, "id":0, "description":null, "setDate":null, "addDate":null};
				break;
				
				default:
				console.log("Erreur : Envoi d'un media de type non reconnu...");
				return;
			}
			
		}
		
		var jsonInput = {
			"id" : t.generateID(),
			"method" : "addMediaIntoItem",
			"params" : [mediaVO, itemId]
		};
		
		var success = success || function(jsonResult) {
			// Retourne l'id du media ajouté
			// console.log(jsonResult);
		};
		
		t.ajax("items", jsonInput, success);
	},

	addMetaIntoVo: function(itemId, metaId, metaContent, success) {
		
		var t = this;
		var metaVO = {"content": metaContent, "id":metaId, "name":"KeyWord", "__className":"Vo_Meta"};
		
		var jsonInput = {
			"id" : t.generateID(),
			"method" : "addMetaIntoVo",
			"params" : [metaVO, itemId]
		};
		
		var success = success || function(jsonResult) {
			// Retourne l'id de la meta ajoutée
			// console.log(jsonResult);
		};
		
		t.ajax("items", jsonInput, success);
	},

	addDataCartoToItem: function(itemId, latitude, longitude, success) {
			
		var t = this;
		
		var userId = t.currentUserId ? t.currentUserId : 0;
		var dataVo = {"x":latitude, "y":longitude, "__className":"Vo_Data_Carto", "id":0, "setDate":null, "addDate":null};

		// {"method":"addDataIntoVo","id":"R7BZ-HISJ-INAM-FNG0-5KB9-7PUH","params":[{"x":48.81390517570364,"addDate":null,"setDate":null,"id":0,"y":2.344161101081081,"__className":"Vo_Data_Carto"},1219]}
		
		var jsonInput = {
			"id" : t.generateID(),
			"method" : "addDataIntoVo",
			"params" : [dataVo, itemId]
		};
		
		// console.log("addDataCartoToItem", jsonInput);
			
		var success = success || function(jsonResult) {
			// Retourne l'id de la data Carto
			// console.log(jsonResult);
		};
		
		t.ajax("items", jsonInput, success);
	},

	
	
	// --------------------------------------------------
	//
	// Formulaire d'Upload
	//
	// --------------------------------------------------

	openUploadView: function() {
	
		var t = this;
		
		$(".onglet").removeClass("active");	// Mathieu Thollet Lot 1 bis
		$(".onglet.motadire").addClass("active");	// Mathieu Thollet Lot 1 bis
		
		var mosaique = $("#mosaique");
		var mosaiqueWidth  = mosaique.width();
		var mosaiqueHeight = mosaique.height();
		
		var popUpElement = $(".uploadParent");
		popUpElement.css("display", "block");
		popUpElement.css("width", mosaiqueWidth + "px");
		popUpElement.css("height", mosaiqueHeight + "px");


		var options =  {
			
			gauche: t.axeHorizontal.gauche,
			droite: t.axeHorizontal.droite,
			bas: t.axeVertical.bas,
			haut: t.axeVertical.haut
		};

		t.popupUpload = new Chatanoo.UploadView( { el : popUpElement } );
		t.popupUpload.urlCarte = t.mapURL;
		t.popupUpload.render( options );

		var popUpContent = $(".uploadContent", popUpElement);
		popUpContent.css("width", mosaiqueWidth + "px");
		popUpContent.css("height", mosaiqueHeight + "px");
		
		t.changeLayoutForUpload();
		
		// Mathieu Thollet lot 1.1 
		//t.initLoginForm();
		t.uploadUserId = t.currentUserId ? t.currentUserId : 0;
		if (t.uploadUserId == 0)
			t.initLoginForm();
		else
			t.initUploadForm();
		// /Mathieu Thollet lot 1.1
	},

	changeLayoutForUpload: function() {
	},
	
	restoreLayoutAfterUpload: function() {
	},
	
	closePopUpWithCloseButton: function() {
		var t = this;
		t.restoreLayoutAfterUpload();
	},
	
	closeUploadView: function() {
		var t = this;
		if (t.tryToLoadConvertedTimeout) clearInterval(t.tryToLoadConvertedTimeout);
		if (t.popupUpload) t.popupUpload.closePopUp();
	},
	
	initLoginForm: function () {
		
		var t = this;
		//t.initUploadQuerySelect(); // Mathieu Lot 1.1

		// Fomulaire de Login
		var loginForm = document.getElementById('loginForm');
		loginForm.onsubmit = function(event) {
			event.preventDefault();
			t.checkLoginForUpload();
		};

		// Fomulaire de Login
		var inscriptionForm = document.getElementById('inscriptionForm');
		inscriptionForm.onsubmit = function(event) {
			event.preventDefault();
			t.addUser();
		};
		
		$(".tabLoginInscription .login").off().on("click", function() {
			$(".loginForm").css("display", "block");
			$(".inscriptionForm").css("display", "none");
			$(".tabLoginInscription .login").removeClass("selected").addClass("selected");
			$(".tabLoginInscription .inscription").removeClass("selected");
		});
		
		$(".tabLoginInscription .inscription").off().on("click", function() {
			$(".loginForm").css("display", "none");
			$(".inscriptionForm").css("display", "block");
			$(".tabLoginInscription .login").removeClass("selected");
			$(".tabLoginInscription .inscription").removeClass("selected").addClass("selected");
		});	
	},
	
	checkLoginForUpload: function() {
		
		var t = this;
		
		var pseudo = $("#pseudo").val();
		var password = $("#password").val();
		
		var success = function(jsonResult) {
			
			if (jsonResult == null)
			{
				alert('Pseudo ou mot de passe incorrect');	// Mathieu Lot 2
			}
			else
			{
				// Identifiants valides
				// console.log("login : user id = ", jsonResult.id);
				t.uploadUserId = t.currentUserId = jsonResult.id;				
				t.authentification ( [ pseudo, password, t.adminParams[2] ] , function() {
					t.initUploadForm();
				});
			}
		};
		
		t.getUserByLogin( pseudo, password, success );
		
	},

	getUserByLogin: function(pseudo, password, success) {
		
		var t = this;
		
		var jsonInput = {
			"id" : t.generateID(),
			"method" : "getUserByLogin",
			"params" : [pseudo, password]
		};
		
		t.ajax("users", jsonInput, success);	
	},
	
	addUser: function() {
		
		var t = this;
		
		var nom = $("#adduser_nom").val();
		var prenom = $("#adduser_prenom").val();
		var pseudo = $("#adduser_pseudo").val();
		var password = $("#adduser_password").val();
		var email = $("#adduser_email").val();

		if (( pseudo.length == 0 ) || ( password.length == 0 ))
		{
			alert ("Attention le pseudo et le mot de passe doivent être remplis !");
			return;
		}

		var success = function(jsonResult) 
		{
			if ( jsonResult != null )
			{
				alert ("Ce pseudo existe déjà !");
			}
			else
			{
				var userVO = {"email":email, "__className":"Vo_User", "id":0, "pseudo":pseudo, "password":password, "isBan":false, "lastName":nom, "role":null, "firstName":prenom, "addDate":null, "setDate":null};
				
				var jsonInput = {
					"id" : t.generateID(),
					"method" : "addUser",
					"params" : [userVO]
				};
				
				var success = function(jsonResult) {
					
					if (jsonResult == null)
					{
					}
					else
					{
						// Nouvel utilisateur
						// console.log("inscription : user id = ", jsonResult.id);				
						t.uploadUserId = t.currentUserId = jsonResult.id;
						t.authentification ( [ pseudo, password, t.adminParams[2] ] , function() {
							t.initUploadForm();
						});
					}
				};
				
				t.ajax("users", jsonInput, success)
			}
		};
		
		// On vérifie d'abord que le couple n'existe pas déjà :
		t.getUserByLogin( pseudo, password, success );
	},

	initUploadQuerySelect: function() {

		var t = this;

		// Liste des questions :
		var questionSelect = $("#formQueries");
		var queryCollection = App.Views.QueriesView.collection;
		
		// 
		t.uploadQueryId = t.currentQuery ? t.currentQuery : queryCollection.at(0).get("id");
		
		// console.log("initUploadForm", queryCollection.length, questionSelect);
		
		queryCollection.each( function (query)
		{
			var queryId = query.get("id");
			var queryTitle = query.get("content");
			
			if (queryId == t.currentQuery)
			{
				// Par défaut on sélectionne la question courante de la mosaïque
				questionSelect.append("<option data-id='" + queryId + "' value=' " + queryId + "' selected='selected'>" +  queryTitle +" </option>");
			}
			else
			{
				questionSelect.append("<option data-id='" + queryId + "' value=' " + queryId + "'>" +  queryTitle +" </option>");
			}
		});
		
		questionSelect.off().on("change", function(e) {
			
			var queryId = $(e.target).val();
			// console.log("change", queryId);
			
			t.uploadQueryId = queryId;
		});
		
	},
	
	disableUploadSubmitButton: function( bool ) {
		document.getElementById('uploadButton').disabled = bool;
	},
	
	initUploadForm: function() {
		
		var t = this;
		
		t.initUploadQuerySelect(); // Mathieu Lot 1.1
		
		// On affiche le formulaire d'upload
		$("#etape_user").css("display", "none");
		//$("#etape_upload").css("display", "block");
		$("#etape_1").css("display", "block");	// Mathieu Thollet lot 1.2
		
		// Titre 
		$("#itemTitle").val("");
		
		// Mots clé 
		t.displayUploadKeyWordSelectionView(); 	// Mathieu Thollet lot 1.2
		
		// Media
		$(".uploadedMedia").html("");
		
		// Texte
		$("#newTextMedia").val("");
		$(".envoiTexte").css("display", "block");
		
		// Champ d'état du téléchargement
		$(".uploadStatus").html("");
		
		/* Mathieu Thollet lot 1.2 */
		/*
		$("#toEtape2Button").siblings(".etape").css("display", "none");
		$("#toEtape2Button").css("display", "none");
		*/
		$('#itemTitle').keydown(function() {
			if ($(this).val() != '' && $('.keyword.selected').length > 0) {
				$("#toEtape2Button").siblings(".etape").css("display", "inline");	// Mathieu Lot 1.2
				$("#toEtape2Button").css("display", "inline");	// Mathieu Lot 1.2
			}
			else {
				$("#toEtape2Button").css("display", "none");		// Mathieu Lot 1.2
			}
		});
		$('#backToEtape1Button').click(function() {
			$("#etape_2").css("display", "none");
			$("#etape_1").css("display", "block");
		});
		$('#backToEtape2Button').click(function() {
			$("#etape_3").css("display", "none");
			$("#etape_2").css("display", "block");
		});
		$("#toEtape4Button").css("display", "none");
		$("#toEtape2Button").off().on("click", function(){ t.validUploadEtape1(); } );
		/* Mathieu Thollet lot 1.2 */
	},
	
	initStep3Form: function() {
		var t = this;
	/* Mathieu Thollet lot 1.2 */
		//
		// a. Envoi d'un simple texte
		//

		var sendTextButton = $("#sendTextMediaButton");
		sendTextButton.off().on("click", function() {
		
			var textTitle = $("#itemTitle").val();
			var textContent = $("#newTextMedia").val();
			if (textContent != '') {		// Mathieu Thollet lot 1.2
				//t.validUploadEtape2( "Text", textTitle, null, textContent);	// Mathieu Thollet lot 1.2
				t.validUploadEtape3( "Text", textTitle, null, textContent);	// Mathieu Thollet lot 1.2
			}
		});
		
		
		//
		// b. Upload d'un media
		//
		
		var form = $("#fileUploadForm");
		var fileSelect = $("#fileSelect");
		
		var uploadButton = $("#uploadButton");
		t.disableUploadSubmitButton(true);

		// http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html
		AWS.config.region = 'eu-west-1';

		AWS.config.credentials = new AWS.CognitoIdentityCredentials({
		  IdentityPoolId: 'eu-west-1:b263aeab-02ae-4268-b338-95e7ea79e255'
		});

		function guid() {
		  function s4() {
		    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
		  }
		  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
		    s4() + '-' + s4() + s4() + s4();
		}
		
		var s3 = new AWS.S3({apiVersion: '2006-03-01'});

		var files;
		var uploadFiles = function (event)
		{
			event.stopPropagation();
			event.preventDefault();
			
			t.disableUploadSubmitButton(true);
		
			if (files.length == 0) return;
			
			// console.log(t.uploadURL, files.length)
		
			var i, file, data = new FormData();
			
			for (i = 0; i < files.length; i++) {
			  file = files[i];
			  data.append('file', file, file.name);
			  // RQ : On ne prend que le premier
			  break;
			}
		
			// Champ d'état du téléchargement
			$(".uploadStatus").html("<img src='/front/core/images/ajax-loader.gif'/> Envoi du média en cours...");	// Mathieu Lot 2 ajout ajax loader
		
			var loadingAnimation = t.startLoadingAnimation();

    		var bucketName = 'chatanoo-medias-input';
			var prefix, filenameToSave, filenameForUpload;
			var extension = file.name.split('.').pop();
			
			if ( file.type.indexOf("image/") == 0)
			{
				// L'image sera uploadée dans "input" puis convertie dans "output"
				prefix = "P";
			}
			else if ( file.type.indexOf("video/") == 0)
			{
				// La vidéo sera uploadée dans "input" puis convertie dans "output"
				prefix = "M";
			}
			else if ( file.type.indexOf("audio/") == 0)
			{
				// Le son sera uploadé dans "input" puis converti dans "output"
				prefix = "A";
			}
			else
			{
				return;
			}

			filenameToSave = prefix + "-" + guid();
			filenameForUpload = filenameToSave + "." + extension;

			var params = {
				Bucket: bucketName, 
				Key: filenameForUpload, 
				ContentType: file.type, 
				Body: file
			};
			
			console.log("s3.upload", params);
			
			s3.upload(params, function (err, data) {
				
				console.log(err ? 'ERROR!' : 'UPLOADED2');
				
				t.stopLoadingAnimation(loadingAnimation);
				
				if (! err)
				{
					$(".uploadStatus").html("Envoi du média réussi");
					t.displayButtonToValidateUploadMedia( filenameToSave );
				}
				else
				{
					$(".uploadStatus").html("Echec de l'envoi du média");
				}
			});
		};
		
		$('input[type=file]').off().on('change', function (event)
		{
			files = event.target.files;
			
			var i, file;
			
			// On vérifie les types MIME des fichiers sélectionnés
			
			// . Sont autorisés : image/jpg, image/png, audio/mpeg (MP3), video/mp4...
			// . Ne sont pas encore autorisés : video/x-flv (FLV), audio/x-m4a (AAC)
			
			for (i = 0; i < files.length; i++) {
			
			  file = files[i];
			  
			  if ((file.type != "image/png") && (file.type != "image/jpeg") 
			  			&& (file.type.indexOf("video/") == -1) && (file.type.indexOf("audio/") == -1)) {
							
				// Type incompatible : on bloque le bouton "Envoyer votre media"
				console.log("Type incompatible", file.type);
				t.disableUploadSubmitButton(true);
				return;
			  }
			  
			  // RQ : On ne prendra que le premier fichier sélectionné
			  break;
			}
			
			t.disableUploadSubmitButton(false);
			
			form.off().on('submit', uploadFiles);
		});
			
	},

	getMediaTypeFromFileName: function( mediaFileName ) {
		
		var filenameArray = mediaFileName.split("-");
		var filenameFirstChar = filenameArray[0];
		
		switch(filenameFirstChar)
		{
			case "P": return "Picture";
			case "M": return "Video";
			case "A": return "Audio";
			case "T": return "Text";
		}
		
		return "Unknown";
	},
	
	//
	
	displayButtonToValidateUploadMedia: function( mediaFileName ) {
		
		var t = this;
		
		// Pas de variable pour le texte
		t.textMediaContent = null;
		
		var mediaTitle = $("#itemTitle").val();
		
		// console.log("displayButtonToValidateUploadMedia", mediaFileName);
		
		var mediaType = t.getMediaTypeFromFileName(mediaFileName);
		
		var uploadButton = $("#uploadButton");
		uploadButton.disabled = true;

		var uploadParent = $(".uploadParent");
		var mediaParent = $(".uploadedMedia", uploadParent);
		
		$(".envoiTexte").css("display", "none");

		var itemId = t.uploadItemId;
		var mediaId = 0;
		var mediaWidth  =  mediaParent.width() || uploadParent.width() * 0.50;
		var mediaHeight = mediaWidth * 2 / 3;

		console.log("displayButtonToValidateUploadMedia", mediaFileName, mediaType, mediaWidth);

		switch(mediaType)
		{
			case "Picture" :
				var callback = function() {
					console.log("... createImageView", mediaParent, itemId, mediaId, mediaFileName);
					var image = t.createImageView( mediaParent, itemId, mediaId, mediaFileName );
				};
				t.tryToLoadConvertedMedia( t.getImageKey(mediaFileName), callback);
				break;

			case "Video" :
				console.log("... createVideoView", mediaParent, itemId, mediaId, mediaFileName, mediaWidth, mediaHeight);
				var callback = function() {
					var video = t.createVideoView( mediaParent, itemId, mediaId, mediaFileName, mediaWidth, mediaHeight );
				};
				t.tryToLoadConvertedMedia( t.getVideoKey(mediaFileName), callback);
				break;

			case "Audio" :
				console.log("... createAudioView", mediaParent, itemId, mediaId, mediaFileName, mediaWidth, mediaHeight);
				var callback = function() {
					var audio = t.createAudioView( mediaParent, itemId, mediaId, mediaFileName, mediaWidth, mediaHeight );
				};
				t.tryToLoadConvertedMedia( t.getAudioKey(mediaFileName), callback);
				break;
		}

		// Script du bouton suite (pas encore visible, en attente de la conversion)
		//$("#toEtape2Button").off().on("click", function(){ t.validUploadEtape2( mediaType, mediaTitle, mediaFileName, null ); } );	// Mathieu Thollet Lot 1.2
		$("#toEtape4Button").off().on("click", function(){ t.validUploadEtape3( mediaType, mediaTitle, mediaFileName, null ); } );
	},

	tryToLoadConvertedMedia: function( mediaAWSKey, callback ) {

		var t = this;
		var s3 = new AWS.S3({apiVersion: '2006-03-01'});
		var bucketName = "chatanoo-medias-output";

		var success = function() {
			// Bouton suite visible suite à la conversion
			//$("#toEtape2Button").siblings(".etape").css("display", "inline");	// Mathieu Thollet lot 1.2
			//$("#toEtape2Button").css("display", "inline");	// Mathieu Thollet lot 1.2
			$("#toEtape4Button").css("display", "inline");	// Mathieu Thollet lot 1.2
		};

		$(".uploadStatus").html("<img src='/front/core/images/ajax-loader.gif'/> Conversion et chargement du média...");	// Mathieu Lot 2 ajout ajax loader

		// On interroge le bucket "output" pour savoir si le media est disponible

		if (t.tryToLoadConvertedTimeout) clearInterval(t.tryToLoadConvertedTimeout);

		t.tryToLoadConvertedTimeout = setInterval( function() {

			console.log("**** tryToLoadConvertedTimeout ****", mediaAWSKey);

			s3.getObject({ Bucket: bucketName, Key: mediaAWSKey }, function (err, data) {
				if (err)
				{
					console.log('Pas encore disponible sur S3 output : mediaAWSKey');
				}
				else
				{
					$(".uploadStatus").html("Votre média a bien été ajouté !");
					clearInterval(t.tryToLoadConvertedTimeout);

					// Le bouton Suite est affiché
					success();

					// Callback
					callback();
				}
			});

		}, 5000);
	},

	/* Mathieu Thollet lot 1.2 */
	validUploadEtape1: function() {
		
		var t = this;
		
		t.uploadVote = $('input:radio[name=sentiment]:checked').val() == "choix1" ? 1 : -1;
		$("#etape_2").css("display", "block");	
		$("#etape_1").css("display", "none");	
		t.displayUploadMapView();
	},
	/* /Mathieu Thollet lot 1.2 */
	
	/* Mathieu Thollet lot 1.2 */
	/*
	validUploadEtape2: function( mediaType, mediaTitle, mediaFileName, textMediaContent ) {
		
		var t = this;
		
		if (t.tryToLoadConvertedTimeout) clearInterval(t.tryToLoadConvertedTimeout);

		console.log("validUploadEtape2", t.mediaViewAndModel);

		if (t.mediaViewAndModel && t.mediaViewAndModel.view) {
			console.log("validUploadEtape2 view", t.mediaViewAndModel);
			t.mediaViewAndModel.view.close();
		}

		$(".uploadParent .uploadedMedia").empty();

		t.uploadMediaType = mediaType;
		t.uploadMediaTitle = mediaTitle;
		t.uploadMediaFileName = mediaFileName;
		t.textMediaContent = textMediaContent;
		
		$("#toEtape2Button").off("click");
		$("#toEtape3Button").off().on("click", function(){ t.validUploadEtape3(); } );
		
		$("#etape_vote").css("display", "block");
		$("#etape_upload").css("display", "none");
	},
	*/
	validUploadEtape2: function( mapX, mapY ) {
		
		var t = this;	
		t.uploadMapX = mapX;
		t.uploadMapY = mapY;
		
		var item = $(".global .uploadParent .uploadContent .uploadBody .mapParent .item");
		if (Draggable.get(item)) Draggable.get(item).kill();

		$("#etape_2").css("display", "none");
		$("#etape_3").css("display", "block");
		
		t.initStep3Form();
	},
	/* /Mathieu Thollet lot 1.2 */
	
	/* Mathieu Thollet lot 1.2 */
	/*	
	validUploadEtape3: function() {
		
		var t = this;
		
		// console.log("validUploadEtape3", $('input:radio[name=sentiment]:checked').val());
		
		// Vote : valeur du vote "Cool/Pas cool"
		t.uploadVote = $('input:radio[name=sentiment]:checked').val() == "choix1" ? 1 : -1;
		
		$("#toEtape3Button").off("click");
		$("#etape_vote").css("display", "none");	
		
		t.displayUploadKeyWordSelectionView();	
	},
	*/
	validUploadEtape3: function( mediaType, mediaTitle, mediaFileName, textMediaContent ) {
		var t = this;
		
		if (t.mediaViewAndModel && t.mediaViewAndModel.view) {
			console.log("validUploadEtape2 view", t.mediaViewAndModel);
			t.mediaViewAndModel.view.close();
		}

		$(".uploadParent .uploadedMedia").empty();

		t.uploadMediaType = mediaType;
		t.uploadMediaTitle = mediaTitle;
		t.uploadMediaFileName = mediaFileName;
		t.textMediaContent = textMediaContent;
		
		t.envoiItemUpload();
	},
	/* /Mathieu Thollet lot 1.2 */

	
	displayUploadKeyWordSelectionView: function() {

		var t = this;
		
		//$("#etape_keyword").css("display", "block");	// Mathieu Thollet lot 1.2
		
		//$("#toEtape4Button").css("display", "none");	// Mathieu Thollet lot 1.2
		//$("#toEtape4Button").siblings(".etape").css("display", "none");	// Mathieu Thollet lot 1.2
		$("#toEtape2Button").css("display", "none");	// Mathieu Thollet lot 1.2
		$("#toEtape2Button").siblings(".etape").css("display", "none");	// Mathieu Thollet lot 1.2
		
		var success = function(jsonResult) {
			
			if (! jsonResult) return;
			
			// console.log("metas", jsonResult.length);
			
			var i, n = jsonResult.length, jsonItem;
			var metas = new MetaCollection();
			
			for(i=0; i<n; i++)
			{
				jsonItem = jsonResult[i];
				switch(jsonItem.name)
				{
					case "KeyWord":
					metas.add( new MetaModel(jsonItem) );
				}
			}
			
			// console.log("fetchMetasOfQuery", metas.length);
			
			t.initUploadKeywordSelect(metas);
		};
	
		// console.log("fetchMetasOfQuery queryId = ", t.uploadQueryId);
	
		// On récupère la liste des mots-clés de la question choisie dans le formulaire
		t.fetchMetasOfQuery(t.uploadQueryId, success);
	},
	
	initUploadKeywordSelect: function( queryKeyWordCollection ) {

		var t = this;
		
		// Liste des mots-clés de la question :
		var keywordsSelect = $("#formKeywords");
		
		keywordsSelect.append("<option value=''>Sélectionnez un mot-clé</option>");
		
		queryKeyWordCollection.each( function (keyword)
		{
			var keywordId = keyword.get("id");
			var keywordTitle = keyword.get("content");
			
			keywordsSelect.append("<option value=' " + keywordId + "'>" +  keywordTitle +" </option>");
		});
		
		keywordsSelect.off().on("change", function(e) {
			var keyWordId = $(e.target).val();
			if (keyWordId != "")
			{
				var keywordTitle = $("#formKeywords option:selected").text();
				
				// Trim white space
				keywordTitle = keywordTitle.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
				
				// console.log("change", keyWordId, keywordTitle);
						
				t.uploadKeyWordId = keyWordId;	// Mathieu Thollet Lot 1.2
				t.uploadKeyWordContent = keywordTitle;	// Mathieu Thollet Lot 1.2

				//t.displayButtonToValidateUploadKeyWord(keyWordId, keywordTitle);	// Mathieu Thollet Lot 1.2
			}
		});
	},	
	
	/* Mathieu Thollet lot 1.2 */
	/*
	displayButtonToValidateUploadKeyWord: function( keyWordId, keywordTitle ) {
		
		var t = this;
		
		// console.log("displayButtonToValidateUploadKeyWord", keyWordId);
		
		$("#toEtape4Button").siblings(".etape").css("display", "inline");
		$("#toEtape4Button").css("display", "inline");
		$("#toEtape4Button").off().on("click", function(){ t.validUploadEtape4(keyWordId, keywordTitle); } );
	},
	validUploadEtape4: function( keyWordId, keywordTitle ) {
		
		var t = this;	
		t.uploadKeyWordId = keyWordId;
		t.uploadKeyWordContent = keywordTitle;
		
		// console.log("validUploadEtape4", keyWordId, keywordTitle);
		
		$("#toEtape4Button").off("click");
		$("#etape_keyword").css("display", "none");
		
		t.displayUploadMapView();
	},
	*/
	/* /Mathieu Thollet lot 1.2 */
	displayUploadMapView: function() {
		
		var t = this;
		
		//$("#etape_map").css("display", "block");	// Mathieu Thollet Lot 1.2
		//$("#toEtape5Button").css("display", "none");	// Mathieu Thollet Lot 1.2
		//$("#toEtape5Button").siblings(".etape").css("display", "none");	// Mathieu Thollet Lot 1.2
		$("#toEtape3Button").css("display", "none");	// Mathieu Thollet Lot 1.2
		$("#toEtape3Button").siblings(".etape").css("display", "none");	// Mathieu Thollet Lot 1.2
		
		// Mathieu Lot 2
		$('#map').width(App.Views.appView.largeurCarte).height(App.Views.appView.longueurCarte);
		$('#formMap').width(App.Views.appView.largeurCarte).height(App.Views.appView.longueurCarte);
		t.mapX = App.Views.appView.centerLatCarte;
		t.mapY = App.Views.appView.centerLongCarte;
		initOpenLayersMap();
		// /Mathieu Lot 2
		
		// Mathieu Lot 2
		/*
		// Drag and drop du perso sur la carte :
		var mapParent =  $(".global .uploadParent .uploadContent .uploadBody .mapParent");
		var item = $(".item", mapParent);
		var map = $(item).siblings(".map");
		var mapWidth = map.width();
		var mapHeight = map.height();
		
		var uploadForm = $(".uploadParent"); 
		mapParent.css("height", uploadForm.height() * 0.5);
		
		var longitudeGauche = t.longitudeGauche;
		var latitudeTop = t.latitudeTop;
		
		var longitudeGaucheDroite = t.longitudeDroite - longitudeGauche;
		var latitudeTopBottom = t.latitudeBottom - latitudeTop;
				
		var mapX = (t.latitudeBottom + latitudeTop) * 0.5;
		var mapY = (t.longitudeDroite + longitudeGauche) * 0.5;
		
		// console.log(mapX, mapY);
		var onDragEnd = function(e) {
			
			var itemDragged = e.currentTarget;
			
			var draggableObject = Draggable.get(item);
			var positionX = draggableObject.x;
			var positionY = draggableObject.y;
			var percentX = positionX / mapWidth;
			var percentY = positionY / mapHeight;
			
			var largCarte = t.largeurCarte;
			var hautCarte = t.longueurCarte;
			
			var longitude = longitudeGauche + percentX * longitudeGaucheDroite;
			var latitude  = latitudeTop + percentY * latitudeTopBottom;

			// On récupère la position du marker sur la carte
			mapX = latitude;
			mapY = longitude;
			 
			// console.log(positionX, positionY, mapWidth, mapHeight, "mapX", mapX, "mapY", mapY);

			// Au premier déplacement, on affiche le bouton de validation :
			//$("#toEtape5Button").css("display", "inline");	// Mathieu Thollet lot 1.2
			//$("#toEtape5Button").siblings(".etape").css("display", "inline");	// Mathieu Thollet lot 1.2
			$("#toEtape3Button").css("display", "inline");	// Mathieu Thollet lot 1.2
			$("#toEtape3Button").siblings(".etape").css("display", "inline");	// Mathieu Thollet lot 1.2
		};
		var draggable = Draggable.create(item, { onDragEnd:onDragEnd });
		TweenLite.set(item, { x: mapWidth * 0.5, y: mapHeight * 0.5 });
		*/
		
		// Bouton de validation de l'étape de la carte :
		//$("#toEtape5Button").siblings(".etape").css("display", "inline");	// Mathieu Thollet lot 1.2
		//$("#toEtape5Button").css("display", "inline");	// Mathieu Thollet lot 1.2
		//$("#toEtape5Button").off().on("click", function(){ t.validUploadEtape5( mapX, mapY); } );	// Mathieu Thollet lot 1.2
		$("#toEtape3Button").siblings(".etape").css("display", "inline");	// Mathieu Thollet lot 1.2
		$("#toEtape3Button").css("display", "inline");	// Mathieu Thollet lot 1.2
		$("#toEtape3Button").off().on("click", function(){ t.validUploadEtape2( t.mapX, t.mapY); } );	// Mathieu Thollet lot 1.2
	},
	
	/* Mathieu Thollet lot 1.2 */
	/*
	validUploadEtape5: function( mapX, mapY ) {
		
		var t = this;	
		t.uploadMapX = mapX;
		t.uploadMapY = mapY;
		
		var item = $(".global .uploadParent .uploadContent .uploadBody .mapParent .item");
		if (Draggable.get(item)) Draggable.get(item).kill();
		
		$("#toEtape5Button").off("click");
		$("#etape_map").css("display", "none");		
		
		t.envoiItemUpload();
	},
	*/

	envoiItemUpload: function() {
		
		//
		// 1. Ajout d'un item à la Query
		//
		
		var t = this;
		
		var successAddItemToQuery = function(jsonResult) {
			
			// console.log("successAddItemToQuery jsonResult = ", jsonResult); 
			
			if (! jsonResult) return;
			
			t.uploadItemId = parseInt(jsonResult);
			t.envoiMediaUpload();			
		};
		
		// Envoi de l'item
		t.addItemIntoQuery(t.uploadQueryId, t.uploadMediaTitle, t.uploadMediaFileName, successAddItemToQuery)
	},
	
	envoiMediaUpload: function() {
		
		var t = this;

		//
		// 2. Ajout d'un media à l'item
		//

		var successAddMediaToItem = function(jsonResult) {
			
			// console.log("successAddMediaToItem jsonResult = ", jsonResult); 
		
			if (! jsonResult) return;
		
			t.uploadMediaId = jsonResult;
			t.envoiVoteUpload();
		};
	
		// Envoi du media
		t.addMediaIntoItem(t.uploadItemId, t.uploadMediaTitle, t.uploadMediaFileName, t.textMediaContent, successAddMediaToItem); 
	},
	
	envoiVoteUpload: function() {
		
		var t = this;
		
		//
		// 3. Ajout d'un vote à l'item
		//

		var successAddVoteToItem = function(jsonResult) {
			
			// console.log("successAddVoteToItem jsonResult = ", jsonResult); 
		
			if (! jsonResult) return;
			
			t.uploadDataVoteId = jsonResult;		
			t.envoiMotCleUpload();
		};
	
		// Envoi du vote
		t.addDataVoteToItem(t.uploadItemId, t.uploadVote, successAddVoteToItem);	
	},
	
	envoiMotCleUpload: function() {
		
		var t = this;
		
		//
		// 4. Ajout d'un mot-clé à l'item
		//
		
		var successAddKeyWordToItem = function(jsonResult) {
		
			// console.log("successAddKeyWordToItem jsonResult = ", jsonResult); 
			
			if (! jsonResult) return;
			
			t.envoiCartoUpload()
		};
	
		// Envoi du mot-clé
		t.addMetaIntoVo(t.uploadItemId, t.uploadKeyWordId, t.uploadKeyWordContent, successAddKeyWordToItem);
	},

	envoiCartoUpload: function() {
				
		var t = this;
	
		//
		// 5. Ajout d'une data de position sur la carte à l'item
		//
		
		var successAddDataCartoToItem = function(jsonResult) {
		
			// console.log("successAddDataCartoToItem jsonResult = ", jsonResult); 
		
			if (! jsonResult) return;
			
			t.finUpload();
		};
		
		// console.log("addDataCartoToItem", t.uploadItemId, t.uploadMapX, t.uploadMapY)
		
		t.addDataCartoToItem(t.uploadItemId, t.uploadMapX, t.uploadMapY, successAddDataCartoToItem);

	},
	
	finUpload: function() {
		
		var t = this;
		
		// Fin de l'upload
		$("#etape_3").css("display", "none");	// Mathieu Thollet Lot 1.2		
		// Mathieu Thollet Lot 1.2
		/*$("#etape_conclusion").css("display", "block");		
		$("#toEtape6Button").off().on("click", function()
		{ 
			$("#toEtape6Button").off("click");
			t.closeUploadView(); 
		} );

		// Nouvel upload
		$("#toEtape1Button").off().on("click", function()
		{ 
			$("#etape_conclusion").css("display", "none");
			$("#toEtape1Button").off("click");
			t.initUploadForm(); 
		} );
		
		// On doit ajouter l'item uploadé dans la liste des  items de la query associée
		// et rafraichir les vues :
		*/
		t.closeUploadView();	// Mathieu Thollet lot 1.2
		t.loadQuery( t.uploadQueryId );
	},


	// --------------------------------------------------
	//
	// Tracé de l'évolution du vote d'un item
	//
	// --------------------------------------------------

	drawEvolutionVote: function( itemId ) {
	},
	
	clearEvolutionVote: function( itemId ) {
	},


	// --------------------------------------------------
	//
	// Général
	//
	// --------------------------------------------------

	startLoadingAnimation: function( target ) {
		
		if (! target) target = $("#attente");
		
		var opts = { color: '#FFFFFF', left: '60%', top: '40%' };
			
		var spinner = new Spinner( opts ).spin();
		target.append(spinner.el);
		
		return spinner;
	},
	
	stopLoadingAnimation: function( spinner ) {
		spinner.stop();
	},
	
	//
	// Webs Services :
	//
	
	ajax: function (serviceName, data, successCallback) {

		var t = this;
		var loadingAnimation = t.startLoadingAnimation();
		
		var ajaxError = function(jqXHR, textStatus, errorThrown)
		{
			t.stopLoadingAnimation(loadingAnimation);
			
			console.log("error :" + textStatus, jqXHR);
		};
		
		var ajaxSuccess	= function(data, textStatus, jqXHR)
		{
			t.stopLoadingAnimation(loadingAnimation);
		
			// Le Proxy PHP renvoie : {"status":{"http_code":200},"contents":{"result":"...","id":"..."}}
			// console.log("success :" + JSON.stringify(data.contents));
			
			if (successCallback) successCallback(data.contents.result);
		};
		
		var ajaxRequest = {
			
			type: "POST",
			url: t.proxy + t.serviceURL + "/" + serviceName + "/json",
			data: JSON.stringify(data),
			dataType: "json",
			contentType: "application/json",
		}
		
		if (t.authentificationID)
		{
			ajaxRequest.beforeSend = function(xhr) {
				  xhr.setRequestHeader("Authorization", t.authentificationID);
			};
		}
		
		// console.log(JSON.stringify(ajaxRequest));
		
		jQuery.ajax(ajaxRequest).done(ajaxSuccess).fail(ajaxError);
	},
	
	generateID: function()
	{
		var num = 24;
		var char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
		var uiid = "";
		for(var i = 0; i < num; i++)
		{
			uiid += char[Math.floor(Math.random() * char.length)];
			if (i%4 == 3 && i != 0 && i < num - 1)
				uiid += '-';
		}
		
		return uiid;
	},
	
});
