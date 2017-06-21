var ViewModule = require( '../../utils/view-module' ),
	LightboxModule;

LightboxModule = ViewModule.extend( {
	oldAspectRatio: null,

	oldAnimation: null,

	getDefaultSettings: function() {
		return {
			classes: {
				aspectRatio: 'elementor-aspect-ratio-%s'
			},
			modalOptions: {
				id: 'elementor-lightbox-modal',
				entranceAnimation: null,
				videoAspectRatio: null,
				position: {
					my: 'center',
					at: 'center'
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
		var defaultOptions = this.getDefaultSettings().modalOptions;

		this.setSettings( 'modalOptions', jQuery.extend( defaultOptions, options.modalOptions ) );

		var modal = this.getModal();

		modal.setID( this.getSettings( 'modalOptions.id' ) );

		modal.onShow = null;

		modal.onHide = null;

		switch ( options.type ) {
			case 'image':
				this.setImageContent( options.url );

				break;
			case 'video':
				this.setVideoContent( options.url );

				break;
			default:
				this.setHTMLContent( options.html );
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

		var self = this,
			$videoFrame = jQuery( '<iframe>', { src: videoEmbedURL } ),
			modal = self.getModal();

		modal.getElements( 'message' ).addClass( 'elementor-video-wrapper' );

		modal.setMessage( $videoFrame );

		self.setVideoAspectRatio();

		modal.onShow = function() {
			DialogsManager.getWidgetType( 'lightbox' ).prototype.onShow.apply( modal, arguments );

			self.setPosition();

			self.setEntranceAnimation();
		};

		modal.onHide = function() {
			DialogsManager.getWidgetType( 'lightbox' ).prototype.onHide.apply( modal, arguments );

			modal.getElements( 'widgetContent' ).removeClass( 'animated' );

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
	}
} );

module.exports = LightboxModule;
