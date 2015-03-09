
(function(){

	var DataDisplay = (function() {

		var _html
				,_compiled
				,_compiledHTML;

		function generateTemplate( templateID, dataModel ) {

			_html = $(templateID).html();
			_compiled = _.template( _html );
			_compiledHTML = _compiled( dataModel );

		}

		function updateView( viewID ) {
			$( viewID ).append( _compiledHTML );
		}

		return {
			generate: generateTemplate
			,update: updateView
		}

	})(); // DataDisplay

	var FlickrAPI = (function(){

		var APIKey = "61291f3f1fae46b86f41b14e2d3b1899"
			,FORMAT = "json"
			,FLICKRAPIURL = "https://api.flickr.com/services/rest/";		

		function createImageSrc( farmId, serverId, id, secret, size ) {

			var imgSrc = "https://farm" + farmId + ".staticflickr.com/" + serverId + "/" + id + "_" + secret + "_" + size + ".jpg";

		return imgSrc;

		}

		function pullFromFlickr( flickrAPIoptions, flickrSuccess ) {

			var APIarguments = {
				apiKey: APIKey
				,format: FORMAT
			}

			$.extend( APIarguments, flickrAPIoptions );
			console.log( "this is APIarguments:", APIarguments );

			var ajaxOptions = {
				url: FLICKRAPIURL
				,data: APIarguments
				,dataType: 'jsonp'
				,jsonCallback: 'jsonFlickrApi'
				,success: flickrSuccess
			}

			$.ajax( ajaxOptions );

		}

		function onFlickrSuccess( data ) {
			
			var slider = $('.bxslider')
					,dataModel = [];

			for( var i = 0; i < data.photos.photo.length; i++ ) {
				var curr = data.photos.photo[ i ]
					,farmId = curr.farm
					,serverId = curr.server
					,id = curr.id
					,secret = curr.secret
					,size = 'b';
				var img = createImageSrc( farmId, serverId, id, secret, size );

				dataModel.push( img );
			}

			return dataModel;
		}

		return {
			pullFromFlickr: pullFromFlickr
			,onFlickrSuccess: onFlickrSuccess
		}


	})(); // FlickrApi

	// initializing

	$('.js-location').on('blur', function() {
		var value = $( this ).val();


		$('#ajaxloader1').show();
		$( this ).remove();

		FlickrAPI.pullFromFlickr(
			// separation of concerns
			// this is how we gather data
			{
				method    : 'flickr.photos.search'
				, text    : value
				, tags	  : 'night'
				, per_page: 10
			}
			// how we handle the view updating
			//, FlickrAPI.onFlickrSuccess
			, function( data ) {
				var dataModel = FlickrAPI.onFlickrSuccess( data );

				for( var i = 0; i < dataModel.length; i++ ) {
					DataDisplay
						.generateTemplate(
							'#flickr-gallery'
							, { imgSrc: dataModel[ i ] }
						);

					DataDisplay.updateView( '.bxslider' );
				}

				$('.bxslider').bxSlider({
					preloadImages: 'all'
				});
				$('#ajaxloader1').hide();
			}	// callback for success: function(data)
		);		// pullFromFlickr
	});			// onblur

})();