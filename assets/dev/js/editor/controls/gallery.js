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
		// eslint-disable-next-line capitalized-comments
		// ui.warnings = '.elementor-control-media__warnings';
		ui.promotions = '.elementor-control-media__promotions';
		ui.promotions_dismiss = '.elementor-control-media__promotions .elementor-control-notice-dismiss';
		ui.promotions_action = '.elementor-control-media__promotions .elementor-control-notice-main-actions button';

		return ui;
	},

	events() {
		return _.extend( ControlBaseDataView.prototype.events.apply( this, arguments ), {
			'click @ui.addImages': 'onAddImagesClick',
			'click @ui.clearGallery': 'onClearGalleryClick',
			'click @ui.galleryThumbnails': 'onGalleryThumbnailsClick',
			'click @ui.promotions_dismiss': 'onPromotionDismiss',
			'click @ui.promotions_action': 'onPromotionAction',
			'keyup @ui.galleryThumbnails': 'onGalleryThumbnailsKeyPress',
		} );
	},

	onReady() {
		this.initRemoveDialog();
	},

	async applySavedValue() {
		var images = this.getControlValue(),
			imagesCount = images.length,
			hasImages = !! imagesCount,
			// eslint-disable-next-line capitalized-comments
			// imagesWithoutAlt = 0,
			imagesWithoutOptimization = 0,
			promotionsAlwaysOn = false;

		const hasPromotions = this.ui.promotions.length && ! elementor.config.user.dismissed_editor_notices.includes( this.getDismissPromotionEventName() );

		this.$el
			.toggleClass( 'elementor-gallery-has-images', hasImages )
			.toggleClass( 'elementor-gallery-empty', ! hasImages );

		var $galleryThumbnails = this.ui.galleryThumbnails;

		$galleryThumbnails.empty();

		/* Translators: %s: Selected images count. */
		this.ui.status.text( hasImages ? sprintf( __( '%s Images Selected', 'elementor' ), imagesCount ) : __( 'No Images Selected', 'elementor' ) );

		if ( hasPromotions ) {
			promotionsAlwaysOn = this.ui.promotions.find( '.elementor-control-notice' ).data( 'display' ) || false;
		}
		if ( ! hasImages ) {
			return;
		}

		const attachments = [];

		this.getControlValue().forEach( ( image, thumbIndex ) => {
			const $thumbnail = jQuery( '<img>', {
				class: 'elementor-control-gallery-thumbnail',
				src: image.url,
				alt: 'gallery-thumbnail-' + thumbIndex,
			} );

			$galleryThumbnails.append( $thumbnail );

			const handleHints = ( attachment ) => {
				const hasAlt = this.imageHasAlt( attachment );
				if ( ! hasAlt ) {
					$thumbnail.addClass( 'unoptimized__image' );
					// eslint-disable-next-line capitalized-comments
					// imagesWithoutAlt += hasAlt ? 0 : 1;
				}

				if ( hasPromotions && this.imageNotOptimized( attachment ) ) {
					imagesWithoutOptimization += 1;
				}
			};

			attachments.push( wp.media.attachment( image.id ).fetch().then( handleHints ) );
		} );

		// Ensure all attachments are fetched before updating the warnings
		await Promise.all( attachments ).then( () => {
			// eslint-disable-next-line capitalized-comments
			// this.ui.warnings.toggle( !! imagesWithoutAlt );
			if ( hasPromotions ) {
				const showHints = promotionsAlwaysOn || !! imagesWithoutOptimization;
				this.ui.promotions.toggle( showHints );
			}
		} );
	},

	hasImages() {
		return !! this.getControlValue().length;
	},

	imageHasAlt( attachment ) {
		const attachmentAlt = attachment?.alt?.trim() || '';
		return !! attachmentAlt;
	},

	imageNotOptimized( attachment ) {
		const checks = {
			height: 1080,
			width: 1920,
			filesizeInBytes: 100000,
		};

		return Object.keys( checks ).some( ( key ) => {
			const value = attachment[ key ] || false;
			return value && value > checks[ key ];
		} );
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

	onPromotionDismiss() {
		this.dismissPromotion( this.getDismissPromotionEventName() );
	},

	getDismissPromotionEventName() {
		const $promotions = this.ui.promotions;
		const $dismissButton = $promotions.find( '.elementor-control-notice-dismiss' );
		// Remove listener
		$dismissButton.off( 'click' );
		return $dismissButton[ 0 ]?.dataset?.event || false;
	},

	hidePromotion( eventName = null ) {
		const $promotions = this.ui.promotions;
		$promotions.hide();
		if ( ! eventName ) {
			eventName = this.getDismissPromotionEventName();
		}
		// Prevent opening the same promotion again in current editor session.
		elementor.config.user.dismissed_editor_notices.push( eventName );
	},

	onPromotionAction( event ) {
		const { action_url: actionURL = null } = JSON.parse( event.target.closest( 'button' ).dataset.settings );
		if ( actionURL ) {
			window.open( actionURL, '_blank' );
		}

		elementorCommon.ajax.addRequest( 'elementor_image_optimization_campaign', {
			data: {
				source: 'io-editor-gallery-install',
			},
		} );

		this.hidePromotion();
	},

	dismissPromotion( eventName ) {
		const $promotions = this.ui.promotions;
		$promotions.hide();
		if ( eventName ) {
			elementorCommon.ajax.addRequest( 'dismissed_editor_notices', {
				data: {
					dismissId: eventName,
				},
			} );

			// Prevent opening the same promotion again in current editor session.
			elementor.config.user.dismissed_editor_notices.push( eventName );
		}
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

		// eslint-disable-next-line capitalized-comments
		// this.ui.warnings.hide();

		if ( this.ui.promotions ) {
			this.ui.promotions.hide();
		}
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
