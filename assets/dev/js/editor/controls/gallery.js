var ControlBaseDataView = require( 'elementor-controls/base-data' ),
	ControlMediaItemView;

ControlMediaItemView = ControlBaseDataView.extend( {
	ui: function() {
		var ui = ControlBaseDataView.prototype.ui.apply( this, arguments );

		ui.addImages = '.elementor-control-gallery-add';
		ui.clearGallery = '.elementor-control-gallery-clear';
		ui.galleryThumbnails = '.elementor-control-gallery-thumbnails';
		ui.status = '.elementor-control-gallery-status-title';

		return ui;
	},

	events: function() {
		return _.extend( ControlBaseDataView.prototype.events.apply( this, arguments ), {
			'click @ui.addImages': 'onAddImagesClick',
			'click @ui.clearGallery': 'onClearGalleryClick',
			'click @ui.galleryThumbnails': 'onGalleryThumbnailsClick',
		} );
	},

	onReady: function() {
		this.initRemoveDialog();
	},

	applySavedValue: function() {
		var images = this.getControlValue(),
			imagesCount = images.length,
			hasImages = !! imagesCount;

		this.$el
			.toggleClass( 'elementor-gallery-has-images', hasImages )
			.toggleClass( 'elementor-gallery-empty', ! hasImages );

		var $galleryThumbnails = this.ui.galleryThumbnails;

		$galleryThumbnails.empty();

		this.ui.status.text( hasImages ? sprintf( '%s Images Selected', imagesCount ) : __( 'No Images Selected', 'elementor' ) );

		if ( ! hasImages ) {
			return;
		}

		this.getControlValue().forEach( function( image ) {
			var $thumbnail = jQuery( '<div>', { class: 'elementor-control-gallery-thumbnail' } );

			$thumbnail.css( 'background-image', 'url(' + image.url + ')' );

			$galleryThumbnails.append( $thumbnail );
		} );
	},

	hasImages: function() {
		return !! this.getControlValue().length;
	},

	openFrame: function( action ) {
		this.initFrame( action );

		this.frame.open();
	},

	initFrame: function( action ) {
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

		// When a file is selected, run a callback.
		this.frame.on( {
			update: this.select,
			'menu:render:default': this.menuRender,
			'content:render:browse': this.gallerySettings,
		}, this );
	},

	menuRender: function( view ) {
		view.unset( 'insert' );
		view.unset( 'featured-image' );
	},

	gallerySettings: function( browser ) {
		browser.sidebar.on( 'ready', function() {
			browser.sidebar.unset( 'gallery' );
		} );
	},

	fetchSelection: function() {
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
	 */
	select: function( selection ) {
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

	onBeforeDestroy: function() {
		if ( this.frame ) {
			this.frame.off();
		}

		this.$el.remove();
	},

	resetGallery: function() {
		this.setValue( [] );

		this.applySavedValue();
	},

	initRemoveDialog: function() {
		var removeDialog;

		this.getRemoveDialog = function() {
			if ( ! removeDialog ) {
				removeDialog = elementorCommon.dialogsManager.createWidget( 'confirm', {
					message: __( 'Are you sure you want to reset this gallery?', 'elementor' ),
					headerMessage: __( 'Reset Gallery', 'elementor' ),
					strings: {
						confirm: __( 'Delete', 'elementor' ),
						cancel: __( 'Cancel', 'elementor' ),
					},
					defaultOption: 'confirm',
					onConfirm: this.resetGallery.bind( this ),
				} );
			}

			return removeDialog;
		};
	},

	onAddImagesClick: function() {
		this.openFrame( this.hasImages() ? 'add' : 'create' );
	},

	onClearGalleryClick: function() {
		this.getRemoveDialog().show();
	},

	onGalleryThumbnailsClick: function() {
		this.openFrame( 'edit' );
	},
} );

module.exports = ControlMediaItemView;
