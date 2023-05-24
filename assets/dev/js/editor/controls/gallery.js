import FilesUploadHandler from '../utils/files-upload-handler';

var ControlBaseDataView = require( 'elementor-controls/base-data' ),
	ControlMediaItemView;

ControlMediaItemView = ControlBaseDataView.extend( {
	ui() {
		var ui = ControlBaseDataView.prototype.ui.apply( this, arguments );

		ui.addImages = '.elementor-control-gallery-add';
		ui.clearGallery = '.elementor-control-gallery-clear';
		ui.galleryThumbnails = '.elementor-control-gallery-thumbnails';
		ui.status = '.elementor-control-gallery-status-title';

		return ui;
	},

	events() {
		return _.extend( ControlBaseDataView.prototype.events.apply( this, arguments ), {
			'click @ui.addImages': 'onAddImagesClick',
			'click @ui.clearGallery': 'onClearGalleryClick',
			'click @ui.galleryThumbnails': 'onGalleryThumbnailsClick',
			'keyup @ui.galleryThumbnails': 'onGalleryThumbnailsKeyPress',
		} );
	},

	onReady() {
		this.initRemoveDialog();
	},

	applySavedValue() {
		var images = this.getControlValue(),
			imagesCount = images.length,
			hasImages = !! imagesCount;

		this.$el
			.toggleClass( 'elementor-gallery-has-images', hasImages )
			.toggleClass( 'elementor-gallery-empty', ! hasImages );

		var $galleryThumbnails = this.ui.galleryThumbnails;

		$galleryThumbnails.empty();

		/* Translators: %s: Selected images count. */
		this.ui.status.text( hasImages ? sprintf( __( '%s Images Selected', 'elementor' ), imagesCount ) : __( 'No Images Selected', 'elementor' ) );

		if ( ! hasImages ) {
			return;
		}

		this.getControlValue().forEach( function( image ) {
			var $thumbnail = jQuery( '<div>', { class: 'elementor-control-gallery-thumbnail' } );

			$thumbnail.css( 'background-image', 'url(' + image.url + ')' );

			$galleryThumbnails.append( $thumbnail );
		} );
	},

	hasImages() {
		return !! this.getControlValue().length;
	},

	openFrame( action ) {
		this.initFrame( action );

		this.frame.open();

		// Set params to trigger sanitizer
		if ( FilesUploadHandler.isUploadEnabled( 'svg' ) ) {
			FilesUploadHandler.setUploadTypeCaller( this.frame );
		}
	},

	initFrame( action ) {
		var frameStates = {
			create: 'gallery',
			add: 'gallery-library',
			edit: 'gallery-edit',
		};

		var options = {
			frame: 'post',
			multiple: true,
			state: frameStates[ action ],
			button: {
				text: __( 'Insert Media', 'elementor' ),
			},
		};

		if ( this.hasImages() ) {
			options.selection = this.fetchSelection();
		}

		this.frame = wp.media( options );

		this.addSvgMimeType();

		// When a file is selected, run a callback.
		this.frame.on( {
			update: this.select,
			'menu:render:default': this.menuRender,
			'content:render:browse': this.gallerySettings,
		}, this );
	},

	addSvgMimeType() {
		if ( ! FilesUploadHandler.isUploadEnabled( 'svg' ) ) {
			return;
		}

		// Add the SVG to the currently allowed extensions
		const oldExtensions = _wpPluploadSettings.defaults.filters.mime_types[ 0 ].extensions;
		this.frame.on( 'ready', () => {
			_wpPluploadSettings.defaults.filters.mime_types[ 0 ].extensions = oldExtensions + ',svg';
		} );

		// Restore allowed upload extensions
		this.frame.on( 'close', () => {
			_wpPluploadSettings.defaults.filters.mime_types[ 0 ].extensions = oldExtensions;
		} );
	},

	menuRender( view ) {
		view.unset( 'insert' );
		view.unset( 'featured-image' );
	},

	gallerySettings( browser ) {
		browser.sidebar.on( 'ready', function() {
			browser.sidebar.unset( 'gallery' );
		} );
	},

	fetchSelection() {
		var attachments = wp.media.query( {
			orderby: 'post__in',
			order: 'ASC',
			type: 'image',
			perPage: -1,
			post__in: _.pluck( this.getControlValue(), 'id' ),
		} );

		return new wp.media.model.Selection( attachments.models, {
			props: attachments.props.toJSON(),
			multiple: true,
		} );
	},

	/**
	 * Callback handler for when an attachment is selected in the media modal.
	 * Gets the selected image information, and sets it within the control.
	 *
	 * @param {Array<*>} selection
	 */
	select( selection ) {
		var images = [];

		selection.each( function( image ) {
			images.push( {
				id: image.get( 'id' ),
				url: image.get( 'url' ),
			} );
		} );

		this.setValue( images );

		this.applySavedValue();
	},

	onBeforeDestroy() {
		if ( this.frame ) {
			this.frame.off();
		}

		this.$el.remove();
	},

	clearGallery() {
		this.setValue( [] );

		this.applySavedValue();
	},

	initRemoveDialog() {
		var removeDialog;

		this.getRemoveDialog = function() {
			if ( ! removeDialog ) {
				removeDialog = elementorCommon.dialogsManager.createWidget( 'confirm', {
					message: __( 'Are you sure you want to clear this gallery?', 'elementor' ),
					headerMessage: __( 'Clear gallery', 'elementor' ),
					strings: {
						confirm: __( 'Clear', 'elementor' ),
						cancel: __( 'Cancel', 'elementor' ),
					},
					defaultOption: 'confirm',
					onConfirm: this.clearGallery.bind( this ),
				} );
			}

			return removeDialog;
		};
	},

	onAddImagesClick() {
		this.openFrame( this.hasImages() ? 'add' : 'create' );
	},

	onClearGalleryClick() {
		this.getRemoveDialog().show();
	},

	onGalleryThumbnailsClick() {
		this.openFrame( 'edit' );
	},

	onGalleryThumbnailsKeyPress( event ) {
		const ENTER_KEY = 13,
			SPACE_KEY = 32;

		if ( ENTER_KEY === event.which || SPACE_KEY === event.which ) {
			this.onGalleryThumbnailsClick( event );
		}
	},
} );

module.exports = ControlMediaItemView;
