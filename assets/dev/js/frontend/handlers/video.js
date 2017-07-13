var HandlerModule = require( 'elementor-frontend/handler-module' ),
	VideoModule;

VideoModule = HandlerModule.extend( {
	getDefaultSettings: function() {
		return {
			selectors: {
				imageOverlay: '.elementor-custom-embed-image-overlay',
				videoWrapper: '.elementor-wrapper',
				videoFrame: 'iframe'
			}
		};
	},

	getDefaultElements: function() {
		var selectors = this.getSettings( 'selectors' );

		var elements = {
			$imageOverlay: this.$element.find( selectors.imageOverlay ),
			$videoWrapper: this.$element.find( selectors.videoWrapper )
		};

		elements.$videoFrame = elements.$videoWrapper.find( selectors.videoFrame );

		return elements;
	},

	getLightBox: function() {
		return elementorFrontend.utils.lightbox;
	},

	handleVideo: function() {
		if ( this.getElementSettings( 'lightbox' ) ) {
			var elementSettings = this.getElementSettings(),
				position = elementSettings.lightbox_content_position;

			var options = {
				type: 'video',
				url: this.elements.$videoFrame.attr( 'src' ),
				modalOptions: {
					id: 'elementor-video-modal-' + this.getID(),
					videoAspectRatio: elementSettings.aspect_ratio
				}
			};

			if ( position ) {
				options.modalOptions.position = {
					my: position,
					at: position
				};
			}

			if ( elementSettings.lightbox_content_animation ) {
				options.modalOptions.entranceAnimation = elementSettings.lightbox_content_animation;
			}

			this.getLightBox().showModal( options );
		} else {
			this.elements.$imageOverlay.remove();

			this.playVideo();
		}
	},

	playVideo: function() {
		var $videoFrame = this.elements.$videoFrame,
			newSourceUrl = $videoFrame[0].src.replace( '&autoplay=0', '' );

		$videoFrame[0].src = newSourceUrl + '&autoplay=1';
	},

	animateVideo: function() {
		this.getLightBox().setEntranceAnimation( this.getElementSettings( 'lightbox_content_animation' ) );
	},

	handleAspectRatio: function() {
		this.getLightBox().setVideoAspectRatio( this.getElementSettings( 'aspect_ratio' ) );
	},

	refreshModalPosition: function() {
		var position = this.getElementSettings( 'lightbox_content_position' );

		this.getLightBox().setPosition( {
			my: position,
			at: position
		} );
	},

	bindEvents: function() {
		this.elements.$imageOverlay.on( 'click', this.handleVideo );
	},

	onElementChange: function( propertyName ) {
		if ( 'lightbox_content_animation' === propertyName ) {
			this.animateVideo();

			return;
		}

		if ( -1 !== [ 'lightbox_content_width', 'lightbox_content_position' ].indexOf( propertyName ) ) {
			this.refreshModalPosition();

			return;
		}

		var isLightBoxEnabled = this.getElementSettings( 'lightbox' );

		if ( 'lightbox' === propertyName && ! isLightBoxEnabled ) {
			this.getLightBox().getModal().hide();

			return;
		}

		if ( 'aspect_ratio' === propertyName && isLightBoxEnabled ) {
			this.handleAspectRatio();

			this.refreshModalPosition();
		}
	}
} );

module.exports = function( $scope ) {
	new VideoModule( { $element: $scope } );
};
