var ControlMultipleBaseItemView = require( 'elementor-controls/base-multiple' ),
	ControlMediaItemView;

ControlMediaItemView = ControlMultipleBaseItemView.extend( {
	cache: {
		loaded: false,
		dialog: false,
		enableClicked: false,
	},

	ui: function() {
		var ui = ControlMultipleBaseItemView.prototype.ui.apply( this, arguments );

		ui.controlMedia = '.elementor-control-media';
		ui.mediaImage = '.elementor-control-media__preview';
		ui.mediaVideo = '.elementor-control-media-video';
		ui.frameOpeners = '.elementor-control-preview-area';
		ui.removeButton = '.elementor-control-media__remove';
		ui.fileName = '.elementor-control-media__file-name';

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
			mediaType = this.getMediaType(),
			fileName = this.getControlValue( 'fileName' );

		if ( 'image' === mediaType ) {
			this.ui.mediaImage.css( 'background-image', url ? 'url(' + url + ')' : '' );
		} else if ( 'video' === mediaType ) {
			this.ui.mediaVideo.attr( 'src', url );
		} else {
			this.ui.fileName.text( fileName );
		}

		this.ui.controlMedia.toggleClass( 'elementor-media-empty', ! url );
	},

	openFrame: function() {
		if ( ! this.isSvgEnabled() && ! elementor.iconManager.cache.svgDialogShown ) {
			return this.getUnfilteredFilesUploadNotEnabledDialog().show();
		}

		if ( ! this.frame ) {
			this.initFrame();
		}

		this.frame.open();

		const selectedId = this.getControlValue( 'id' );

		if ( ! selectedId ) {
			return;
		}

		this.frame.state().get( 'selection' ).add( wp.media.attachment( selectedId ) );
	},

	isSvgEnabled() {
		if ( ! this.cache.enableClicked ) {
			console.log('is svg enabled', this.model.get( 'is_svg_enabled' ));
			return this.model.get( 'is_svg_enabled' );
		}
		return true;
	},

	// Trying a temp solution.
	getUnfilteredFilesUploadNotEnabledDialog() {
		const onConfirm = () => {
			elementorCommon.ajax.addRequest( 'enable_svg_uploads', {}, true );
			elementor.iconManager.cache.svgDialogShown = true;
			this.openFrame();
		};
		return elementor.helpers.getSimpleDialog(
			'elementor-enable-svg-dialog',
			elementor.translate( 'enable_svg' ),
			elementor.translate( 'dialog_confirm_enable_svg' ),
			elementor.translate( 'enable' ),
			onConfirm
		);
	},

	deleteImage: function( event ) {
		event.stopPropagation();

		this.setValue( {
			url: '',
			id: '',
			fileName: '',
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
			button: {
				text: elementor.translate( 'insert_media' ),
			},
			states: [
				new wp.media.controller.Library( {
					title: elementor.translate( 'insert_media' ),
					library: wp.media.query( { type: this.getMediaType() } ),
					multiple: false,
					date: false,
				} ),
			],
		} );

		/*
		// TODO - remove
		// Not working on the first time (require a page reload after value was changed) + working place function
		elementorCommon.ajax.addRequest( 'enable_svg_uploads', {}, true );

		// TODO -remove
		if ( this.model.get( 'is_json_upload_enabled' ) && 'application/json' === this.getMediaType() ) {
			const oldExtensions = _wpPluploadSettings.defaults.filters.mime_types[ 0 ].extensions;

			// TODO - allowing display of JSON files in the media select file window
			this.frame.on( 'ready', () => {
				_wpPluploadSettings.defaults.filters.mime_types[ 0 ].extensions = 'json';
			} );

			this.frame.on( 'close', () => {
				// restore allowed upload extensions
				_wpPluploadSettings.defaults.filters.mime_types[ 0 ].extensions = oldExtensions;
			} );
		}
		 */

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
		var attachment = this.frame.state().get( 'selection' ).first().toJSON();

		if ( attachment.url ) {
			this.setValue( {
				url: attachment.url,
				id: attachment.id,
				fileName: attachment.filename,
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
