var ControlBaseItemView = require( 'elementor-views/controls/base' ),
	ControlMediaItemView;

ControlMediaItemView = ControlBaseItemView.extend( {
	ui: function() {
		var ui = ControlBaseItemView.prototype.ui.apply( this, arguments );

		ui.controlMedia = '.elementor-control-media';
		ui.frameOpeners = '.elementor-control-media-upload-button, .elementor-control-media-image';
		ui.deleteButton = '.elementor-control-media-delete';

		return ui;
	},

	childEvents: {
		'click @ui.frameOpeners': 'openFrame',
		'click @ui.deleteButton': 'deleteImage'
	},

	onReady: function() {
		if ( _.isEmpty( this.getControlValue() ) ) {
			this.ui.controlMedia.addClass( 'media-empty' );
		}
	},

	openFrame: function() {
		this.initFrame();

		this.frame.open();
	},

	deleteImage: function() {
		this.setValue( '' );
		this.render();
	},

	/**
	 * Create a media modal select frame, and store it so the instance can be reused when needed.
	 */
	initFrame: function() {
		var options,
			ids = this.getControlValue();

		options = {
			frame:  'post',
			multiple: true,
			button: {
				text: 'Insert Media'
			},
			state: 'gallery'
		};
		
		if ( 0 < ids.length ) {
			options.selection = this.fetchSelection( ids );
			options.state = 'gallery-edit';
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
	}
} );

module.exports = ControlMediaItemView;
