var ControlBaseItemView = require( 'elementor-views/controls/base' ),
	ControlMediaItemView;

ControlMediaItemView = ControlBaseItemView.extend( {
	ui: function() {
		var ui = ControlBaseItemView.prototype.ui.apply( this, arguments );

		ui.controlMedia = '.elementor-control-media';
		ui.buttonContainer = '.elementor-control-media-upload-button';
		ui.createGallery = '.elementor-gallery-create-gallery';
		ui.addGallery = '.elementor-gallery-add-gallery';
		ui.editGallery = '.elementor-gallery-edit-gallery';
		ui.resetGallery = '.elementor-gallery-reset-gallery';
		ui.galleryCount = '.elementor-gallery-edit-gallery .elementor-gallery-count';
		ui.frameOpeners = '.elementor-gallery-create-gallery, .elementor-gallery-add-gallery, .elementor-gallery-edit-gallery';

		return ui;
	},

	childEvents: {
		'click @ui.frameOpeners': 'openFrame',
		'click @ui.resetGallery': 'resetGallery'
	},

	onReady: function() {
		var ids = this.getControlValue(),
			idsLength = 0;

		if ( _.isEmpty( ids ) ) {
			this.ui.controlMedia.addClass( 'media-empty' );
		}

		if ( 0 < ids.length ) {
			var idsArr = ids.split( ',' );
			idsLength = idsArr.length;
		}

		if ( 0 <  idsLength ) {
			this.ui.createGallery.hide();
			this.ui.addGallery.show();
			this.ui.editGallery.show();
			this.ui.resetGallery.show();
		} else {
			this.ui.createGallery.show();
			this.ui.addGallery.hide();
			this.ui.editGallery.hide();
			this.ui.resetGallery.hide();
		}

		this.ui.galleryCount.html( '(' + idsLength + ')' );

		this.initRemoveDialog();
	},

	openFrame: function( event ) {
		var action = this.$( event.currentTarget ).data( 'action' );
		this.initFrame( action );

		this.frame.open();
	},

	initFrame: function( action ) {
		var options,
			ids = this.getControlValue();

		options = {
			frame:  'post',
			multiple: true,
			button: {
				text: 'Insert Media'
			}
		};

		switch ( action ) {
			case 'create':
				options.state = 'gallery';
				break;
			case 'add':
				options.state = 'gallery-library';
				break;
			case 'edit':
				options.state = 'gallery-edit';
				break;
			default:
				options.state = 'gallery';
		}

		if ( 0 < ids.length ) {
			options.selection = this.fetchSelection( ids );
		}

		this.frame = wp.media( options );

		// When a file is selected, run a callback.
		this.frame.on( 'update', _.bind( this.select, this ) );
		this.frame.on( 'menu:render:default', _.bind( this.menuRender, this ) );
		this.frame.on( 'content:render:browse', _.bind( this.gallerySettings, this ) );
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

	fetchSelection: function( ids ) {
		var idArray = ids.split( ',' ),
			args = {
				orderby: 'post__in',
				order: 'ASC',
				type: 'image',
				perPage: -1,
				post__in: idArray
			},
			attachments = wp.media.query( args ),
			selection = new wp.media.model.Selection( attachments.models, {
				props: attachments.props.toJSON(),
				multiple: true
			} );

		return selection;
	},

	/**
	 * Callback handler for when an attachment is selected in the media modal.
	 * Gets the selected image information, and sets it within the control.
	 */
	select: function( selection ) {
		var ids = selection.pluck( 'id' );

		this.setValue( ids.toString() );
		this.render();
	},

	onBeforeDestroy: function() {
		if ( this.frame ) {
			this.frame.off( 'update' );
			this.frame.off( 'menu:render:default' );
			this.frame.off( 'content:render:browse' );
		}

		this.$el.remove();
	},

	resetGallery: function() {
		this.getRemoveDialog().show();
	},

	initRemoveDialog: function() {
		var removeDialog;

		this.getRemoveDialog = function() {
			if ( ! removeDialog ) {
				removeDialog = elementor.dialogsManager.createWidget( 'confirm', {
					message: elementor.translate( 'dialog_confirm_gallery_delete' ),
					headerMessage: elementor.translate( 'delete_gallery' ),
					strings: {
						confirm: elementor.translate( 'delete' ),
						cancel: elementor.translate( 'cancel' )
					},
					defaultOption: 'confirm',
					onConfirm: _.bind( function() {
						this.setValue( '' );
						this.render();
					}, this )
				} );
			}

			return removeDialog;
		};
	}

} );

module.exports = ControlMediaItemView;
