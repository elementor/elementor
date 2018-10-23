const ControlMultipleBaseItemView = require( 'elementor-controls/base-multiple' );
const ControlMediaItemView = ControlMultipleBaseItemView.extend( {
	ui: function() {
		const ui = ControlMultipleBaseItemView.prototype.ui.apply( this, arguments );

		ui.controlMedia = '.elementor-control-media';
		ui.mediaImage = '.elementor-control-media-image';
		ui.mediaSvg = '.elementor-control-media-svg';
		ui.mediaVideo = '.elementor-control-media-video';
		ui.frameOpeners = '.elementor-control-preview-area';
		ui.deleteButton = '.elementor-control-media-delete';

		return ui;
	},

	events: function() {
		return _.extend( ControlMultipleBaseItemView.prototype.events.apply( this, arguments ), {
			'click @ui.frameOpeners': 'openFrame',
			'click @ui.deleteButton': 'deleteImage',
		} );
	},

	getMediaType: function() {
		return this.model.get( 'media_type' );
	},

	getUploadParams: function() {
		return this.model.get( 'upload_params' );
	},

	applySavedValue: function() {
		const url = this.getControlValue( 'url' ),
			mediaType = this.getMediaType();

		if ( 'image' === mediaType ) {
			this.ui.mediaImage.css( 'background-image', url ? 'url(' + url + ')' : '' );
		} else if ( 'video' === mediaType ) {
			this.ui.mediaVideo.attr( 'src', url );
		} else if ( mediaType.indexOf( 'svg' ) > -1 ) {
			this.ui.mediaSvg.css( 'background-image', url ? 'url(' + url + ')' : '' );
		}

		this.ui.controlMedia.toggleClass( 'elementor-media-empty', ! url );
	},

	openFrame: function() {
		if ( ! this.frame ) {
			this.initFrame();
		}

		this.frame.open();

		const uploadParams = this.getUploadParams();
		if ( uploadParams ) {
			this.frame.uploader.uploader.param( 'uploadTypeCaller', 'elementor-editor-upload' );
			for ( const param in uploadParams ) {
				if ( uploadParams.hasOwnProperty( param ) ) {
					this.frame.uploader.uploader.param( param, uploadParams[ param ] );
				}
			}
		}
	},

	deleteImage: function( event ) {
		event.stopPropagation();

		this.setValue( {
			url: '',
			id: '',
		} );

		this.applySavedValue();
	},

	getLibrary: function() {
		const type = this.getMediaType();
		//if ( 'image' === type || 'video' === type ) {
			return wp.media.query( { type: type } );
		//}
		//return { type: type };
	},

	/**
	 * Create a media modal select frame, and store it so the instance can be reused when needed.
	 */
	initFrame: function() {
		const self = this;
		// Set current doc id to attach uploaded images.
		wp.media.view.settings.post.id = elementor.config.document.id;
		this.frame = wp.media( {
			button: {
				text: elementor.translate( 'insert_media' ),
			},
			states: [
				new wp.media.controller.Library( {
					title: elementor.translate( 'insert_media' ),
					library: self.getLibrary(),
					multiple: false,
					date: false,
				} ),
			],
		} );

		// When a file is selected, run a callback.
		this.frame.on( 'insert select', this.select.bind( this ) );
	},

	/**
	 * Callback handler for when an attachment is selected in the media modal.
	 * Gets the selected image information, and sets it within the control.
	 */
	select: function() {
		this.trigger( 'before:select' );

		// Get the attachment from the modal frame.
		const attachment = this.frame.state().get( 'selection' ).first().toJSON();

		if ( attachment.url ) {
			this.setValue( {
				url: attachment.url,
				id: attachment.id,
			} );

			this.applySavedValue();
		}

		this.trigger( 'after:select' );
	},

	onBeforeDestroy: function() {
		this.$el.remove();
	},
} );

module.exports = ControlMediaItemView;
