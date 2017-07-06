var ViewModule = require( '../../utils/view-module' ),
	LightboxModule;

LightboxModule = ViewModule.extend( {
	oldAspectRatio: null,

	oldAnimation: null,

	getDefaultSettings: function() {
		var position = elementorFrontend.getGeneralSettings( 'elementor_lightbox_content_position' );

		return {
			classes: {
				aspectRatio: 'elementor-aspect-ratio-%s'
			},
			modalOptions: {
				id: 'elementor-lightbox-modal',
				entranceAnimation: elementorFrontend.getGeneralSettings( 'elementor_lightbox_content_animation' ),
				videoAspectRatio: null,
				position: {
					my: position,
					at: position
				}
			}
		};
	},

	getModal: function() {
		if ( ! LightboxModule.modal ) {
			this.initModal();
		}

		return LightboxModule.modal;
	},

	initModal: function() {
		var self = this;

		var modal = LightboxModule.modal = elementorFrontend.getDialogsManager().createWidget( 'lightbox', {
			className: 'elementor-lightbox-modal',
			closeButton: true
		} );

		modal.on( 'hide', function() {
			modal.setMessage( '' );
		} );
	},

	showModal: function( options ) {
		var self = this,
			defaultOptions = self.getDefaultSettings().modalOptions;

		self.setSettings( 'modalOptions', jQuery.extend( defaultOptions, options.modalOptions ) );

		var modal = self.getModal();

		modal.setID( self.getSettings( 'modalOptions.id' ) );

		modal.onShow = function() {
			DialogsManager.getWidgetType( 'lightbox' ).prototype.onShow.apply( modal, arguments );

			self.setPosition();

			setTimeout( function() {
				self.setEntranceAnimation();
			}, 1 );
		};

		modal.onHide = function() {
			DialogsManager.getWidgetType( 'lightbox' ).prototype.onHide.apply( modal, arguments );

			modal.getElements( 'widgetContent' ).removeClass( 'animated' );
		};

		switch ( options.type ) {
			case 'image':
				self.setImageContent( options.url );

				break;
			case 'video':
				self.setVideoContent( options.url );

				break;
			default:
				self.setHTMLContent( options.html );
		}

		modal.show();
	},

	setHTMLContent: function( html ) {
		this.getModal().setMessage( html );
	},

	setImageContent: function( imageURL ) {
		var $image = jQuery( '<img>', { src: imageURL } );

		this.getModal().setMessage( $image );
	},

	setVideoContent: function( videoEmbedURL ) {
		videoEmbedURL = videoEmbedURL.replace( '&autoplay=0', '' ) + '&autoplay=1';

		var $videoFrame = jQuery( '<iframe>', { src: videoEmbedURL } ),
			modal = this.getModal();

		modal.getElements( 'message' ).addClass( 'elementor-video-wrapper' );

		modal.setMessage( $videoFrame );

		this.setVideoAspectRatio();

		var onHideMethod = modal.onHide;

		modal.onHide = function() {
			onHideMethod();

			modal.getElements( 'message' ).removeClass( 'elementor-video-wrapper' );
		};
	},

	setVideoAspectRatio: function( aspectRatio ) {
		aspectRatio = aspectRatio || this.getSettings( 'modalOptions.videoAspectRatio' );

		var $widgetContent = this.getModal().getElements( 'widgetContent' ),
			oldAspectRatio = this.oldAspectRatio,
			aspectRatioClass = this.getSettings( 'classes.aspectRatio' );

		this.oldAspectRatio = aspectRatio;

		if ( oldAspectRatio ) {
			$widgetContent.removeClass( aspectRatioClass.replace( '%s', oldAspectRatio ) );
		}

		if ( aspectRatio ) {
			$widgetContent.addClass( aspectRatioClass.replace( '%s', aspectRatio ) );
		}
	},

	setEntranceAnimation: function( animation ) {
		animation = animation || this.getSettings( 'modalOptions.entranceAnimation' );

		var $widgetContent = this.getModal().getElements( 'widgetContent' );

		if ( this.oldAnimation ) {
			$widgetContent.removeClass( this.oldAnimation );
		}

		this.oldAnimation = animation;

		if ( animation ) {
			$widgetContent.addClass( 'animated ' + animation );
		}
	},

	setPosition: function( position ) {
		position = position || this.getSettings( 'modalOptions.position' );

		this.getModal()
			.setSettings( 'position', position )
			.refreshPosition();
	},

	onInit: function() {
		ViewModule.prototype.onInit.apply( this, arguments );

		if ( elementorFrontend.isEditMode() ) {
			elementor.settings.general.model.on( 'change', this.onGeneralSettingsChange );
		}
	},

	onGeneralSettingsChange: function( model ) {
		if ( 'elementor_lightbox_width' in model.changed ) {
			this.getModal().refreshPosition();
		}

		if ( 'elementor_lightbox_content_position' in model.changed ) {
			var position = elementorFrontend.getGeneralSettings( 'elementor_lightbox_content_position' );

			this.setSettings( 'modalOptions.position', {
				my: position,
				at: position
			} );

			this.setPosition();
		}

		if ( 'elementor_lightbox_content_animation' in model.changed ) {
			this.setEntranceAnimation();
		}
	}
} );

module.exports = LightboxModule;
