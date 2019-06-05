const ControlMultipleBaseItemView = require( 'elementor-controls/base-multiple' );
import IconLibrary from './../components/icons-manager/classes/icon-library';

class ControlIconsView extends ControlMultipleBaseItemView {
	enqueueIconFonts( iconType ) {
		const iconSetting = elementor.helpers.getIconLibrarySettings( iconType );
		if ( false === iconSetting ) {
			return;
		}

		if ( iconSetting.enqueue ) {
			iconSetting.enqueue.forEach( ( assetURL ) => {
				elementor.helpers.enqueueStylesheet( assetURL, false );
			} );
		}

		if ( iconSetting.url ) {
			elementor.helpers.enqueueStylesheet( iconSetting.url, false );
		}
	}

	ui() {
		const ui = super.ui();
		ui.frameOpeners = '.elementor-control-preview-area';
		ui.svgUploader = '.elementor-control-svg-uploader';
		ui.deleteButton = '.elementor-control-icon-delete';
		ui.previewContainer = '.elementor-control-icons-preview';
		ui.previewPlaceholder = '.elementor-control-icons-preview-placeholder';

		return ui;
	}

	cache() {
		return {
			loaded: false,
		};
	}

	onRender() {
		super.onRender();
		if ( ! this.cache.loaded ) {
			elementor.config.icons.forEach( ( library ) => {
				if ( 'all' === library.name ) {
					return;
				}
				IconLibrary.initIconType( library );
			} );
			this.cache.loaded = true;
		}
	}

	events() {
		return _.extend( ControlMultipleBaseItemView.prototype.events.apply( this, arguments ), {
			'click @ui.frameOpeners': 'openPicker',
			'click @ui.svgUploader': 'openFrame',
			'click @ui.deleteButton': 'deleteIcon',
		} );
	}

	initFrame() {
		// Set current doc id to attach uploaded images.
		wp.media.view.settings.post.id = elementor.config.document.id;
		this.frame = wp.media( {
			button: {
				text: elementor.translate( 'insert_media' ),
			},
			states: [
				new wp.media.controller.Library( {
					title: elementor.translate( 'insert_media' ),
					library: wp.media.query( { type: 'image/svg+xml' } ),
					multiple: false,
					date: false,
				} ),
			],
		} );

		// When a file is selected, run a callback.
		this.frame.on( 'insert select', () => this.selectSvg() );
	}

	/**
	 * Callback handler for when an attachment is selected in the media modal.
	 * Gets the selected image information, and sets it within the control.
	 */
	selectSvg() {
		this.trigger( 'before:select' );

		// Get the attachment from the modal frame.
		var attachment = this.frame.state().get( 'selection' ).first().toJSON();

		if ( attachment.url ) {
			this.setValue( {
				value: {
					url: attachment.url,
					id: attachment.id,
				},
				library: 'svg',
			} );

			this.applySavedValue();
		}
		this.trigger( 'after:select' );
	}

	openFrame() {
		event.stopPropagation();

		if ( ! this.frame ) {
			this.initFrame();
		}

		this.frame.open();

		// Set params to trigger sanitizer
		this.frame.uploader.uploader.param( 'uploadTypeCaller', 'elementor-editor-upload' );
		this.frame.uploader.uploader.param( 'svg_type', 'icon' );

		const selectedId = this.getControlValue( 'id' );
		if ( ! selectedId ) {
			return;
		}

		const selection = this.frame.state().get( 'selection' );
		selection.add( wp.media.attachment( selectedId ) );
	}

	openPicker() {
		elementor.iconManager.show( { view: this } );
	}

	applySavedValue() {
		const iconValue = this.getControlValue( 'value' ),
			iconType = this.getControlValue( 'library' );

		if ( ! iconValue ) {
			this.ui.frameOpeners.toggleClass( 'elementor-preview-has-icon', !! iconValue );
			return;
		}
		const previewHTML = '<i class="' + iconValue + '"></i>';
		this.ui.previewPlaceholder.html( previewHTML );
		this.ui.frameOpeners.toggleClass( 'elementor-preview-has-icon', !! iconValue );
		this.enqueueIconFonts( iconType );
	}

	deleteIcon( event ) {
		event.stopPropagation();

		this.setValue( {
			value: '',
			library: '',
		} );

		this.applySavedValue();
	}

	onBeforeDestroy() {
		this.$el.remove();
	}
}
module.exports = ControlIconsView;
