import FilesUploadHandler from '../utils/files-upload-handler';

var ControlMultipleBaseItemView = require( 'elementor-controls/base-multiple' ),
	ControlMediaItemView;

ControlMediaItemView = ControlMultipleBaseItemView.extend( {
	ui: function() {
		var ui = ControlMultipleBaseItemView.prototype.ui.apply( this, arguments );

		ui.controlMedia = '.elementor-control-media';
		ui.mediaImage = '.elementor-control-media__preview';
		ui.mediaVideo = '.elementor-control-media-video';
		ui.frameOpeners = '.elementor-control-preview-area';
		ui.removeButton = '.elementor-control-media__remove';
		ui.fileName = '.elementor-control-media__file__content__info__name';

		return ui;
	},

	events: function() {
		return _.extend( ControlMultipleBaseItemView.prototype.events.apply( this, arguments ), {
			'click @ui.frameOpeners': 'openFrame',
			'click @ui.removeButton': 'deleteImage',
		} );
	},

	getMediaType: function() {
		return this.model.get( 'media_type' );
	},

	applySavedValue: function() {
		var url = this.getControlValue( 'url' ),
			mediaType = this.getMediaType();

		if ( 'image' === mediaType ) {
			this.ui.mediaImage.css( 'background-image', url ? 'url(' + url + ')' : '' );
		} else if ( 'video' === mediaType ) {
			this.ui.mediaVideo.attr( 'src', url );
		} else {
			const fileName = url ? url.split( '/' ).pop() : '';
			this.ui.fileName.text( fileName );
		}

		this.ui.controlMedia.toggleClass( 'elementor-media-empty', ! url );
	},

	openFrame: function( e ) {
		const mediaType = e?.target?.dataset?.mediaType || this.getMediaType();

		if ( ! FilesUploadHandler.isUploadEnabled( mediaType ) ) {
			FilesUploadHandler.getUnfilteredFilesNotEnabledDialog( () => this.openFrame( e ) ).show();

			return false;
		}

		if ( ! this.frame ) {
			this.initFrame();
		}

		this.frame.open();

		// Set params to trigger sanitizer
		FilesUploadHandler.setUploadTypeCaller( this.frame );

		const selectedId = this.getControlValue( 'id' );

		if ( ! selectedId ) {
			return;
		}

		this.frame.state().get( 'selection' ).add( wp.media.attachment( selectedId ) );
	},

	deleteImage: function( event ) {
		event.stopPropagation();

		this.setValue( {
			url: '',
			id: '',
		} );

		this.applySavedValue();
	},

	/**
	 * Create a media modal select frame, and store it so the instance can be reused when needed.
	 */
	initFrame: function() {
		// Set current doc id to attach uploaded images.
		wp.media.view.settings.post.id = elementor.config.document.id;
		this.frame = wp.media( {
			frame: 'post',
			type: 'image',
			multiple: false,
			states: [
				new wp.media.controller.Library( {
					title: elementor.translate( 'insert_media' ),
					library: wp.media.query( { type: this.getMediaType() } ),
					multiple: false,
					date: false,
				} ),
			],
		} );

		// Remove unwanted elements when frame is opened.
		this.frame.on( 'ready open', this.onFrameReady.bind( this ) );

		// When a file is selected, run a callback.
		this.frame.on( 'insert select', this.select.bind( this ) );

		if ( elementor.config.filesUpload.unfilteredFiles ) {
			this.setUploadMimeType( this.frame, this.getMediaType() );
		}
	},

	/**
	 * Hack to remove unwanted elements from modal.
	 */
	onFrameReady() {
		const frameElement = document.querySelector( '.media-modal.wp-core-ui' );

		const elementsToRemove = [
			'#menu-item-insert',
			'#menu-item-gallery',
			'#menu-item-playlist',
			'#menu-item-video-playlist',
			'.embed-link-settings',
		];

		elementsToRemove.forEach( ( selector ) => {
			const el = frameElement.querySelector( selector );

			if ( el ) {
				el.remove();
			}
		} );

		// Remove elements from the URL upload tab.
		frameElement.classList.add( 'elementor-wp-media-elements-removed' );

		// Go to the custom upload tab.
		frameElement.querySelector( '#menu-item-library' ).click();
	},

	setUploadMimeType( frame, ext ) {
		// Add unfiltered files to the allowed upload extensions
		const oldExtensions = _wpPluploadSettings.defaults.filters.mime_types[ 0 ].extensions;

		frame.on( 'ready', () => {
			_wpPluploadSettings.defaults.filters.mime_types[ 0 ].extensions = ( 'application/json' === ext ) ? 'json' : oldExtensions + ',svg';
		} );

		this.frame.on( 'close', () => {
			// Restore allowed upload extensions
			_wpPluploadSettings.defaults.filters.mime_types[ 0 ].extensions = oldExtensions;
		} );
	},

	/**
	 * Callback handler for when an attachment is selected in the media modal.
	 * Gets the selected image information, and sets it within the control.
	 */
	select: function() {
		this.trigger( 'before:select' );

		const state = this.frame.state();
		let attachment;

		if ( 'embed' === state.get( 'id' ) ) {
			// Insert from URL.
			attachment = {
				url: state.props.get( 'url' ),
				id: '',
			};
		} else {
			// Get the attachment from the modal frame.
			attachment = this.frame.state().get( 'selection' ).first().toJSON();
		}

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
