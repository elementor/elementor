var HandlerModule = require( 'elementor-frontend/handler-module' ),
	VideoModule;

VideoModule = HandlerModule.extend( {
	getDefaultSettings: function() {
		return {
			selectors: {
				imageOverlay: '.elementor-custom-embed-image-overlay',
				video: '.elementor-video',
				videoIframe: '.elementor-video-iframe'
			}
		};
	},

	getDefaultElements: function() {
		var selectors = this.getSettings( 'selectors' );

		return {
			$imageOverlay: this.$element.find( selectors.imageOverlay ),
			$video: this.$element.find( selectors.video ),
			$videoIframe: this.$element.find( selectors.videoIframe )
		};
	},

	getLightBox: function() {
		return elementorFrontend.utils.lightbox;
	},

	handleVideo: function() {
		if ( ! this.getElementSettings( 'lightbox' ) ) {
			var lazy_load = this.elements.$imageOverlay.data( 'lazy-load' );
			if ( lazy_load ) {
				var self = this,
					iframe = document.createElement( 'iframe');
				iframe.setAttribute( 'src', lazy_load + '&autoplay=1' );
				iframe.setAttribute( 'class', 'elementor-video-iframe' );
				iframe.setAttribute( 'allowfullscreen', 'allowfullscreen' );
				// Chrome 67 Iframe delegation https://developers.google.com/web/updates/2017/09/autoplay-policy-changes#iframe
				iframe.setAttribute( 'allow', 'autoplay' );
				this.elements.$imageOverlay.before( iframe );
				self.elements.$imageOverlay.remove();

			} else {
				this.elements.$imageOverlay.remove();
				this.playVideo();
			}
		}
	},

	playVideo: function() {
		if ( this.elements.$video.length ) {
			this.elements.$video[0].play();

			return;
		}

		var $videoIframe = this.elements.$videoIframe,
			newSourceUrl = $videoIframe[0].src.replace( '&autoplay=0', '' );

		$videoIframe[0].src = newSourceUrl + '&autoplay=1';
	},

	animateVideo: function() {
		this.getLightBox().setEntranceAnimation( this.getElementSettings( 'lightbox_content_animation' ) );
	},

	handleAspectRatio: function() {
		this.getLightBox().setVideoAspectRatio( this.getElementSettings( 'aspect_ratio' ) );
	},

	bindEvents: function() {
		this.elements.$imageOverlay.on( 'click', this.handleVideo );
	},

	onElementChange: function( propertyName ) {
		if ( 'lightbox_content_animation' === propertyName ) {
			this.animateVideo();

			return;
		}

		var isLightBoxEnabled = this.getElementSettings( 'lightbox' );

		if ( 'lightbox' === propertyName && ! isLightBoxEnabled ) {
			this.getLightBox().getModal().hide();

			return;
		}

		if ( 'aspect_ratio' === propertyName && isLightBoxEnabled ) {
			this.handleAspectRatio();
		}
	}
} );

module.exports = function( $scope ) {
	new VideoModule( { $element: $scope } );
};
