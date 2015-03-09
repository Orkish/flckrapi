(function(){ // protect the lemmings!

	/**************************************
		
		THIS FILE DEFINES SEVERAL MODULES
		EACH MODULE PERFORMS A SPECIFIC TASK
		THESE TASKS, COMBINED, WILL YEILD AN
		APP THAT MIRROS FUNCTIONALITY OF THE
		YAHOO! WEATHER APP

		BUILT BY: FEWD37

	**************************************/


	/**************************************
					MODULES
	**************************************/

	var DataDisplay = (function(){
		/*
		 *
		 *	this module is responsible for 
		 *	taking data and compiling _ template
		 *	and displaying
		 *
		 */
		// public variables here

		// private variables here
		var __html, __compiled, __compiledHTML;

		// private methods here

		// public methods here
		/*
		 *
		 *	this method will take the following args
		 *		templateID	: 	the ID of the script tag
		 *						that holds the template
		 *		dataModel	:  	the javascript obj that holds 
		 *						the info
		 *
		 */
		function generateTemplate( templateID, dataModel ) {
			// REMEMBER: _.template is a function
			// that belongs to the underscore library
			// the __compiled, __html is a PRIVATE variable
			// that belongs to our module

			// grab the template from the <script>
			__html = $( templateID ).html();

			// call the templated method of underscore lib
			__compiled = _.template( __html );

			// pass in the datamodel to get our compiled HTML
			__compiledHTML = __compiled( dataModel );

		}

		/*
		 *
		 *	this method will simply push
		 *	the compiled HTML into the view
		 *	aka the Frontend
		 *	this method will take the following arg
		 *		viewID		: 	the selector where we put the compiled
		 *						data into 
		 *
		 */
		 function updateView( viewID ) {
		 	$( viewID ).append( __compiledHTML );
		 }

		// exposed (public) methods and variables
		return {
			generateTemplate: generateTemplate
			, updateView: updateView
		}

	})();

	var FlickrAPI = (function(){

		/*
		 *
		 *	this module is responsible for 
		 *	pulling data from the Flickr API
		 *	it only handles data and does nothing
		 *	with the view
		 *
		 */

		 // private variables here
		 var __APIKEY__ = "39fbd739ec37bc67440415aeba7d40e2"
			, __FORMAT__= 'json'
			, __FLICKRAPIBASE__ = 'https://api.flickr.com/services/rest/';

		 // private methods here
		/*
		 *
		 *	this method will take in a few data points
		 *	returned by the Flickr API and use it
		 *	to generate a img URL for the results
		 *
		 */
		function _assembleImageSrc( farmId, serverId, id, secret, size ) {
			var imgSrc = 'https://farm'
						  + farmId
						  + '.staticflickr.com/'
						  + serverId
						  + '/'
						  + id
						  + '_'
						  + secret
						  + '_'
						  + size
						  + '.jpg';
			return imgSrc;
		}
		
		// public methods here
		/*
		 *
		 *	THIS IS A GENERALIZED VERSION OF THE PREVIOUS METHOD
		 *	This method will take in two arguments
		 *		flickrAPIoptions: 	object where we can pass in any flickr API option
		 *		flickrSuccess: 		referring to what happens if ajax call returns
		 *							successfully
		 *	Given those two arguments, it will make an ajax call
		 *	to flick api
		 *
		 */
		function pullFlickrGeneral( flickrAPIoptions, flickrSuccess ) {
			var APIArguments = {
				api_key: __APIKEY__
				, format: __FORMAT__
			};

			$.extend( APIArguments, flickrAPIoptions );
			console.log( APIArguments );


			var ajaxOptions = {
				url: __FLICKRAPIBASE__
				, data: APIArguments
				, dataType: 'jsonp'
				, jsonpCallback: 'jsonFlickrApi'
				, success: flickrSuccess
			}

			$.ajax( ajaxOptions );

		} // pullFlickrGeneral

		/*
		 *
		 *	This method is a callback
		 *	It gets run after an ajax call returns successfully
		 * 	It will generate URLs for flickr and return these urls
		 *	as an array
		 *
		 */
		function onFlickrSuccess( data ) {
			var slider = $('.bxslider')
				, dataModel = [];

			for(
				var i = 0;						// start condition, i => the index of the array
				i < data.photos.photo.length; 	// end condition
				i++								// continue @ condition
			) {
				var curr 		= data.photos.photo[ i ]
					, farmId 	= curr.farm
					, serverId 	= curr.server
					, id 		= curr.id
					, secret 	= curr.secret
					, size		= 'b';

				var img = _assembleImageSrc(
					farmId
					, serverId
					, id
					, secret
					, size
				);

				// lets push the image src into our dataModel array
				dataModel.push( img );

				/************************************
	
					REMOVING THIS PORTION OF THE CODE
					BECAUSE OUR DISLAYDATA MODULE WILL 
					HANDLE. THIS FUNCTION WILL NOW _ONLY_
					RETURN AN ARRAY OF IMG SRCES

				*************************************/

				// create an empty <li></li>
				// var myListItem = $( '<li/>' )
				// // create an empty <img> tag
				// 	, myImageItem = $( '<img/>' );

				// // set our img tag with a src => <img src="[URL">
				// myImageItem.attr('src', img);
				// // put our img tag into the li tag
				// myListItem.append( myImageItem );

				// // insert our LI tag, which has the img tag
				// // into the slider
				// slider.append( myListItem );

			} // for 

			// return this data model so that it can be used elsewhere
			return dataModel;

			/************************************

				REMOVING THIS PORTION OF THE CODE
				BECAUSE OUR DISLAYDATA MODULE WILL 
				HANDLE. THIS FUNCTION WILL NOW _ONLY_
				RETURN AN ARRAY OF IMG SRCES

			*************************************/

			// $('#ajaxloader1').hide();
			// $('.bxslider').bxSlider({
			// 	preloadImages: 'all'
			// });

		} // onFlickrSuccess

		// exposed (public) methods and variables
		/*
		 *
		 *	here is how we return our methods:
		 *	{
		 *		TITLE: FUNCTION NAME
		 *	}
		 *	usually, we make the title and function name the same
		 *
		 */
		 return {
		 	pullFlickrGeneral: pullFlickrGeneral
		 	, onFlickrSuccess: onFlickrSuccess
		 }
	})(); // FlickrAPI

	/**************************************
				INITIALIZATION
	**************************************/
	$('.js-location').on('blur', function() {
		var value = $( this ).val();


		$('#ajaxloader1').show();
		$( this ).remove();

		FlickrAPI.pullFlickrGeneral(
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
		);		// pullFlickrGeneral
	});			// onblur

})();	// lemmings


/*********************************

USEFUL RESROUCES
http://jsfiddle.net/n4kd82p3/
http://jsfiddle.net/999ztxst/
http://jsfiddle.net/e98byn08/
http://jsfiddle.net/xoxhpx7n/

REFERENCES

HOW TO PROTECT THE LEMMINGS:

(function(){})()

GENERAL MODULE template
*/
	// var ModuleName = (function(){
	// 	/*
	// 	 *
	// 	 *	this module is responsible for 
	// 	 *	DESCRIPTION
	// 	 *
	// 	 */


	// 	// private variables here

	// 	// private methods here

	// 	// public methods here

	// 	// exposed (public) methods and variables

	// })();