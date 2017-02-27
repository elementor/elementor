var FrontendModule = require( 'elementor-frontend/frontend-module' ),
	VideoModule;

VideoModule = FrontendModule.extend( {
	oldAnimation: null,

	oldAspectRatio: null,

	getElementName: function() {
		return 'video';
	},

	getDefaultSettings: function() {
		return {
			selectors: {
				imageOverlay: '.elementor-custom-embed-image-overlay',
				videoWrapper: '.elementor-wrapper',
				videoFrame: 'iframe'
			},
			classes: {
				aspectRatio: 'elementor-aspect-ratio-%s'
			}
		};
	},

	getDefaultElements: function() {
		var selectors = this.getSettings( 'selectors' );

		var elements = {
			$lightBoxContainer: jQuery( elementorFrontend.getScopeWindow().document.body ),
			$imageOverlay: this.$element.find( selectors.imageOverlay ),
			$videoWrapper: this.$element.find( selectors.videoWrapper )
		};

		elements.$videoFrame = elements.$videoWrapper.find( selectors.videoFrame );

		return elements;
	},

	getClosureMethodsNames: function() {
		return FrontendModule.prototype.getClosureMethodsNames.apply( this, arguments ).concat( [ 'handleVideo', 'playVideo' ] );
	},

	getLightBoxModal: function() {
		if ( ! VideoModule.lightBoxModal ) {
			this.initLightBoxModal();
		}

		return VideoModule.lightBoxModal;
	},

	initLightBoxModal: function() {
		var self = this;

		var lightBoxModal = VideoModule.lightBoxModal = elementorFrontend.dialogsManager.createWidget( 'lightbox', {
			id: 'elementor-widget-video-modal',
			container: self.getElements( '$lightBoxContainer' ),
			closeButton: true,
			position: {
				within: elementorFrontend.getScopeWindow()
			}
		} );

		lightBoxModal.refreshPosition = function() {
			var position = self.getElementSettings( 'lightbox_content_position' );

			lightBoxModal.setSettings( 'position', {
				my: position,
				at: position
			} );

			DialogsManager.getWidgetType( 'lightbox' ).prototype.refreshPosition.apply( lightBoxModal, arguments );
		};

		lightBoxModal.getElements( 'message' ).addClass( 'elementor-video-wrapper' );
	},

	handleVideo: function() {
		var self = this,
			elements = self.getElements(),
			$videoFrame = elements.$videoFrame,
			isLightBoxEnabled = self.getElementSettings( 'lightbox' );

		if ( isLightBoxEnabled ) {
			var lightBoxModal = self.getLightBoxModal(),
				$widgetContent = lightBoxModal.getElements( 'widgetContent' );

			lightBoxModal.onHide = function() {
				DialogsManager.getWidgetType( 'lightbox' ).prototype.onHide.apply( lightBoxModal, arguments );

				$videoFrame.remove();

				$widgetContent.removeClass( 'animated' );
			};

			self.handleAspectRatio();

			lightBoxModal
				.setMessage( $videoFrame )
				.show( function() {
					self.playVideo();

					self.animateVideo();
				} );
		} else {
			elements.$imageOverlay.remove();

			self.playVideo();
		}
	},

	playVideo: function() {
		var $videoFrame = this.getElements( '$videoFrame' ),
			newSourceUrl = $videoFrame[0].src.replace( '&autoplay=0', '' );

		$videoFrame[0].src = newSourceUrl + '&autoplay=1';
	},

	animateVideo: function() {
		var animation = this.getElementSettings( 'lightbox_content_animation' ),
			$widgetContent = this.getLightBoxModal().getElements( 'widgetContent' );

		if ( this.oldAnimation ) {
			$widgetContent.removeClass( this.oldAnimation );
		}

		this.oldAnimation = animation;

		if ( animation ) {
			$widgetContent.addClass( 'animated ' + animation );
		}
	},

	handleAspectRatio: function() {
		var $widgetContent = this.getLightBoxModal().getElements( 'widgetContent' ),
			oldAspectRatio = this.oldAspectRatio,
			aspectRatio = this.getElementSettings( 'aspect_ratio' ),
			aspectRatioClass = this.getSettings( 'classes.aspectRatio' );

		this.oldAspectRatio = aspectRatio;

		if ( oldAspectRatio ) {
			$widgetContent.removeClass( aspectRatioClass.replace( '%s', oldAspectRatio ) );
		}

		$widgetContent.addClass( aspectRatioClass.replace( '%s', aspectRatio ) );
	},

	bindEvents: function() {
		FrontendModule.prototype.bindEvents.apply( this, arguments );

		this.getElements( '$imageOverlay' ).on( 'click', this.handleVideo );
	},

	onElementChange: function( propertyName ) {
		if ( 'lightbox_content_animation' === propertyName ) {
			this.animateVideo();

			return;
		}

		var lightBoxModal = this.getLightBoxModal();

		if ( -1 !== [ 'lightbox_content_width', 'lightbox_content_position' ].indexOf( propertyName ) ) {
			lightBoxModal.refreshPosition();

			return;
		}

		var isLightBoxEnabled = this.getElementSettings( 'lightbox' );

		if ( 'lightbox' === propertyName && ! isLightBoxEnabled ) {
			lightBoxModal.hide();

			return;
		}

		if ( 'aspect_ratio' === propertyName && isLightBoxEnabled ) {
			this.handleAspectRatio();

			lightBoxModal.refreshPosition();
		}
	}
} );

VideoModule.lightBoxModal = null;

module.exports = function( $scope ) {
	new VideoModule( $scope );
};
