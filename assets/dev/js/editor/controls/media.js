import FilesUploadHandler from '../utils/files-upload-handler';
import { showJsonUploadWarningMessageIfNeeded } from 'elementor-utils/json-upload-warning-message';

var ControlMultipleBaseItemView = require( 'elementor-controls/base-multiple' ),
	ControlMediaItemView;

ControlMediaItemView = ControlMultipleBaseItemView.extend( {
	ui() {
		var ui = ControlMultipleBaseItemView.prototype.ui.apply( this, arguments );

		ui.controlMedia = '.elementor-control-media';
		ui.mediaImage = '.elementor-control-media__preview';
		ui.mediaVideo = '.elementor-control-media-video';
		ui.frameOpeners = '.elementor-control-preview-area';
		ui.removeButton = '.elementor-control-media__remove';
		// eslint-disable-next-line capitalized-comments
		// ui.warnings = '.elementor-control-media__warnings';
		ui.promotions = '.elementor-control-media__promotions';
		ui.promotions_dismiss = '.elementor-control-media__promotions .elementor-control-notice-dismiss';
		ui.promotions_action = '.elementor-control-media__promotions .elementor-control-notice-main-actions button';
		ui.fileName = '.elementor-control-media__file__content__info__name';
		ui.mediaInputImageSize = '.e-image-size-select';

		return ui;
	},

	events() {
		return _.extend( ControlMultipleBaseItemView.prototype.events.apply( this, arguments ), {
			'click @ui.frameOpeners': 'openFrame',
			'click @ui.removeButton': 'deleteImage',
			'change @ui.mediaInputImageSize': 'onMediaInputImageSizeChange',
			'click @ui.promotions_dismiss': 'onPromotionDismiss',
			'click @ui.promotions_action': 'onPromotionAction',
		} );
	},

	getMediaType() {
		// `get( 'media_type' )` is for BC.
		return this.mediaType || this.model.get( 'media_type' ) || this.model.get( 'media_types' )[ 0 ];
	},

	/**
	 * Get library type for `wp.media` using a given media type.
	 *
	 * @param {string} mediaType - The media type to get the library for.
	 * @return {string} library media type
	 */
	getLibraryType( mediaType ) {
		if ( ! mediaType ) {
			mediaType = this.getMediaType();
		}

		return ( 'svg' === mediaType ) ? 'image/svg+xml' : mediaType;
	},

	applySavedValue() {
		const value = this.getControlValue( 'url' ),
			url = value || this.getControlPlaceholder()?.url,
			attachmentId = this.getControlValue( 'id' ),
			isPlaceholder = ( ! value && url ),
			mediaType = this.getMediaType();

		if ( [ 'image', 'svg' ].includes( mediaType ) ) {
			this.ui.mediaImage.css( 'background-image', url ? 'url(' + url + ')' : '' );

			if ( isPlaceholder ) {
				this.ui.mediaImage.css( 'opacity', 0.5 );
			}
		} else if ( 'video' === mediaType ) {
			this.ui.mediaVideo.attr( 'src', url );
		} else {
			const fileName = url ? url.split( '/' ).pop() : '';
			this.ui.fileName.text( fileName );
		}

		if ( this.ui.mediaInputImageSize ) {
			let imageSize = this.getControlValue( 'size' );

			if ( isPlaceholder ) {
				imageSize = this.getControlPlaceholder()?.size;
			}

			this.ui.mediaInputImageSize
				.val( imageSize )
				.toggleClass( 'e-select-placeholder', isPlaceholder );
		}

		this.ui.controlMedia
			.toggleClass( 'e-media-empty', ! value )
			.toggleClass( 'e-media-empty-placeholder', ( ! value && ! isPlaceholder ) );

		if ( 'image' === mediaType ) {
			if ( attachmentId ) {
				const dismissPromotionEventName = this.getDismissPromotionEventName();
				const handleHints = ( attachment ) => {
					// eslint-disable-next-line capitalized-comments
					// this.ui.warnings.toggle( ! this.imageHasAlt( attachment ) );
					if ( this.ui.promotions.length && ! elementor.config.user.dismissed_editor_notices.includes( dismissPromotionEventName ) ) {
						const alwaysOn = this.ui.promotions.find( '.elementor-control-notice' ).data( 'display' ) || false;
						const showHint = alwaysOn || this.imageNotOptimized( attachment );
						this.ui.promotions.toggle( showHint );
					}
				};
				wp.media.attachment( attachmentId ).fetch().then( handleHints );
			} else {
				// eslint-disable-next-line capitalized-comments
				// this.ui.warnings.hide();

				// eslint-disable-next-line no-lonely-if
				if ( this.ui.promotions.length ) {
					this.ui.promotions.hide();
				}
			}
		}
	},

	async openFrame( e, source = null ) {
		const mediaType = e?.target?.dataset?.mediaType || this.getMediaType();
		this.mediaType = mediaType;

		if ( ! mediaType ) {
			return;
		}

		if ( ! FilesUploadHandler.isUploadEnabled( mediaType ) ) {
			FilesUploadHandler.getUnfilteredFilesNotEnabledDialog( () => this.openFrame( e, 'filter-popup' ) ).show();

			return false;
		}

		if ( source !== 'filter-popup' && [ 'application/json', 'json' ].includes( mediaType ) ) {
			await showJsonUploadWarningMessageIfNeeded( {
				introductionMap: window.elementor.config.user.introduction,
				IntroductionClass: window.elementorModules.editor.utils.Introduction,
			} );
		}

		// If there is no frame, or the current initialized frame contains a different library than
		// the `data-media-type` of the clicked button, (re)initialize the frame.
		if ( ! this.frame || this.getLibraryType( mediaType ) !== this.currentLibraryType ) {
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

	deleteImage( event ) {
		event.stopPropagation();

		this.setValue( {
			url: '',
			id: '',
		} );

		this.applySavedValue();
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

	getDismissPromotionEventName() {
		const $promotions = this.ui.promotions;
		const $dismissButton = $promotions.find( '.elementor-control-notice-dismiss' );
		// Remove listener
		$dismissButton.off( 'click' );
		return $dismissButton[ 0 ]?.dataset?.event || false;
	},

	onPromotionDismiss() {
		this.dismissPromotion( this.getDismissPromotionEventName() );
	},

	onPromotionAction( event ) {
		const { action_url: actionURL = null } = JSON.parse( event.target.closest( 'button' ).dataset.settings );
		if ( actionURL ) {
			window.open( actionURL, '_blank' );
		}
		this.hidePromotion();
	},

	dismissPromotion( eventName ) {
		this.hidePromotion( eventName );
		if ( eventName ) {
			elementorCommon.ajax.addRequest( 'dismissed_editor_notices', {
				data: {
					dismissId: eventName,
				},
			} );
		}
	},

	hidePromotion( eventName = null ) {
		const $promotions = this.ui.promotions;
		$promotions.hide();
		if ( ! eventName ) {
			eventName = this.getDismissPromotionEventName();
		}

		elementorCommon.ajax.addRequest( 'elementor_image_optimization_campaign', {
			data: {
				source: 'io-editor-image-install',
			},
		} );

		// Prevent opening the same promotion again in current editor session.
		elementor.config.user.dismissed_editor_notices.push( eventName );
	},

	onMediaInputImageSizeChange() {
		if ( ! this.model.get( 'has_sizes' ) ) {
			return;
		}

		const currentControlValue = this.getControlValue(),
			placeholder = this.getControlPlaceholder();

		const hasImage = ( '' !== currentControlValue?.id ),
			hasPlaceholder = placeholder?.id,
			hasValue = hasImage || hasPlaceholder;

		if ( ! hasValue ) {
			return;
		}

		const shouldUpdateFromPlaceholder = ( hasPlaceholder && ! hasImage );

		if ( shouldUpdateFromPlaceholder ) {
			this.setValue( {
				...placeholder,
				size: currentControlValue.size,
			} );

			if ( this.model.get( 'responsive' ) ) {
				// Render is already calls `applySavedValue`, therefore there's no need for it in this case.
				this.renderWithChildren();
			} else {
				this.applySavedValue();
			}

			this.onMediaInputImageSizeChange();

			return;
		}

		let imageURL;

		elementor.channels.editor.once( 'imagesManager:detailsReceived', ( data ) => {
			imageURL = data[ currentControlValue.id ]?.[ currentControlValue.size ];

			if ( imageURL ) {
				currentControlValue.url = imageURL;
				this.setValue( currentControlValue );
			}
		} );

		imageURL = elementor.imagesManager.getImageUrl( {
			id: currentControlValue.id,
			url: currentControlValue.url,
			size: currentControlValue.size,
		} );

		if ( imageURL ) {
			currentControlValue.url = imageURL;
			this.setValue( currentControlValue );
		}
	},

	/**
	 * Create a media modal select frame, and store it so the instance can be reused when needed.
	 */
	initFrame() {
		const mediaType = this.getMediaType();
		this.currentLibraryType = this.getLibraryType( mediaType );

		// Set current doc id to attach uploaded images.
		wp.media.view.settings.post.id = elementor.config.document.id;
		this.frame = wp.media( {
			frame: 'post',
			type: 'image',
			multiple: false,
			states: [
				new wp.media.controller.Library( {
					title: __( 'Insert Media', 'elementor' ),
					library: wp.media.query( { type: this.currentLibraryType } ),
					multiple: false,
					date: false,
				} ),
			],
		} );

		// Remove unwanted elements when frame is opened.
		this.frame.on( 'ready open', this.onFrameReady.bind( this ) );

		// When a file is selected, run a callback.
		this.frame.on( 'insert select', this.select.bind( this ) );

		if ( elementorCommon.config.filesUpload.unfilteredFiles ) {
			this.setUploadMimeType( this.frame, mediaType );
		}
	},

	/**
	 * Hack to remove unwanted elements from modal & Open the `Insert from URL` tab.
	 */
	onFrameReady() {
		const $frame = this.frame.$el;

		const elementsToRemove = [
			'#menu-item-insert',
			'#menu-item-gallery',
			'#menu-item-playlist',
			'#menu-item-video-playlist',
			'.embed-link-settings',
		];

		$frame.find( elementsToRemove.join( ',' ) ).remove();

		// Change the default button text using CSS by passing the text as a variable.
		$frame.css( '--button-text', `'${ __( 'Insert Media', 'elementor' ) }'` );

		// Remove elements from the URL upload tab.
		$frame.addClass( 'e-wp-media-elements-removed' );

		if ( 'url' === this.getControlValue( 'source' ) ) {
			// Go to the url tab.
			$frame.find( '#menu-item-embed' ).trigger( 'click' );

			// Hide the top media tabs ( WordPress does that automatically if a real user clicks the url tab ).
			$frame.addClass( 'hide-router' );

			// Load the image URL.
			this.frame.views.get( '.media-frame-content' )[ 0 ].url.model.set( {
				url: this.getControlValue( 'url' ),
				alt: this.getControlValue( 'alt' ),
			} );
		} else {
			// Go to the upload tab.
			$frame.find( '#menu-item-library' ).trigger( 'click' );
		}
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
	select() {
		this.trigger( 'before:select' );

		const state = this.frame.state();
		let attachment;

		if ( 'embed' === state.get( 'id' ) ) {
			// Insert from URL.
			attachment = {
				url: state.props.get( 'url' ),
				id: '',
				alt: state.props.get( 'alt' ),
				source: 'url',
			};
		} else {
			// Get the attachment from the modal frame.
			attachment = this.frame.state().get( 'selection' ).first().toJSON();
			attachment.source = 'library';
		}

		if ( attachment.url ) {
			this.setValue( {
				url: attachment.url,
				id: attachment.id,
				alt: attachment.alt,
				source: attachment.source,
				size: this.model.get( 'default' ).size,
			} );

			if ( this.model.get( 'responsive' ) ) {
				// Render is already calls `applySavedValue`, therefore there's no need for it in this case.
				this.renderWithChildren();
			} else {
				this.applySavedValue();
			}
		}

		this.onMediaInputImageSizeChange();

		this.trigger( 'after:select' );
	},

	onBeforeDestroy() {
		this.$el.remove();
	},
} );

module.exports = ControlMediaItemView;
