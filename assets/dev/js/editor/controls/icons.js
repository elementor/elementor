const ControlMultipleBaseItemView = require( 'elementor-controls/base-multiple' );

class ControlIconsView extends ControlMultipleBaseItemView {
	constructor( ...args ) {
		super( ...args );
		this.cache = {
			loaded: false,
			dialog: false,
			enableClicked: false,
		};
	}

	enqueueIconFonts( iconType ) {
		const iconSetting = elementor.helpers.getIconLibrarySettings( iconType );
		if ( false === iconSetting ) {
			return;
		}

		if ( iconSetting.enqueue ) {
			iconSetting.enqueue.forEach( ( assetURL ) => {
				elementor.helpers.enqueueEditorStylesheet( assetURL );
				elementor.helpers.enqueuePreviewStylesheet( assetURL );
			} );
		}

		if ( iconSetting.url ) {
			elementor.helpers.enqueueEditorStylesheet( iconSetting.url );
			elementor.helpers.enqueuePreviewStylesheet( iconSetting.url );
		}
	}

	ui() {
		const ui = super.ui();
		ui.frameOpeners = '.elementor-control-preview-area';
		ui.svgUploader = '.elementor-control-svg-uploader';
		ui.iconPicker = '.elementor-control-icon-picker';
		ui.deleteButton = '.elementor-control-icon-delete';
		ui.previewContainer = '.elementor-control-icons-preview';
		ui.previewPlaceholder = '.elementor-control-icons-preview-placeholder';

		return ui;
	}

	getControlValue() {
		const value = super.getControlValue(),
			model = this.model,
			controlToMigrate = model.get( 'fa4compatibility' );

		// Bail if no migration flag
		if ( ! controlToMigrate ) {
			return value;
		}

		// Check if already migrated
		const didMigration = this.elementSettingsModel.get( '__fa4_migrated' ),
			controlName = model.get( 'name' );

		if ( didMigration && didMigration[ controlName ] ) {
			return value;
		}

		// Check if there is a value to migrate
		const valueToMigrate = this.elementSettingsModel.get( controlToMigrate );
		if ( ! valueToMigrate ) {
			// Set flag as migrated
			this.setControlAsMigrated( controlName );
			return value;
		}

		return this.migrateFa4toFa5( valueToMigrate );
	}

	migrateFa4toFa5( fa4Value ) {
		const fa5Value = elementor.helpers.mapFa4ToFa5( fa4Value );
		this.setControlAsMigrated( this.model.get( 'name' ) );
		if ( fa5Value ) {
			this.setValue( fa5Value );
		}
		return fa5Value;
	}

	setControlAsMigrated( controlName ) {
		const didMigration = this.elementSettingsModel.get( '__fa4_migrated' ) || {};
		didMigration[ controlName ] = true;
		this.elementSettingsModel.setExternalChange( '__fa4_migrated', didMigration );
	}

	onRender() {
		super.onRender();
		if ( ! this.cache.loaded ) {
			elementor.helpers.fetchFa4ToFa5Mapping();
			elementor.config.icons.forEach( ( library ) => {
				if ( 'all' === library.name ) {
					return;
				}
				elementor.iconManager.library.initIconType( library );
			} );
			this.cache.loaded = true;
		}
	}

	events() {
		return jQuery.extend( ControlMultipleBaseItemView.prototype.events.apply( this, arguments ), {
			'click @ui.iconPicker': 'openPicker',
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

		const handleSelect = () => this.selectSvg();

		// When a file is selected, run a callback.
		this.frame.on( 'insert select', handleSelect );
	}

	/**
	 * Callback handler for when an attachment is selected in the media modal.
	 * Gets the selected image information, and sets it within the control.
	 */
	selectSvg() {
		this.trigger( 'before:select' );

		// Get the attachment from the modal frame.
		const attachment = this.frame.state().get( 'selection' ).first().toJSON();

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

	getSvgNotEnabledDialog() {
		if ( ! this.cache.dialog ) {
			const onConfirm = () => {
				this.cache.enableClicked = true;
				window.open( ElementorConfig.settings_page_link + '#tab-advanced', '_blank' );
			};
			this.cache.dialog = elementorCommon.dialogsManager.createWidget( 'confirm', {
				id: 'elementor-enable-svg-dialog',
				headerMessage: elementor.translate( 'enable_svg' ),
				message: elementor.translate( 'dialog_confirm_enable_svg' ),
				position: {
					my: 'center center',
					at: 'center center',
				},
				strings: {
					confirm: elementor.translate( 'enable' ),
					cancel: elementor.translate( 'cancel' ),
				},
				onConfirm: onConfirm,
			} );
		}
		return this.cache.dialog;
	}

	isSvgEnabled() {
		if ( ! this.cache.enableClicked ) {
			return this.model.get( 'is_svg_enabled' );
		}
		return true;
	}

	openFrame() {
		event.stopPropagation();

		if ( ! this.isSvgEnabled() ) {
			const dialog = this.getSvgNotEnabledDialog();
			this.cache.dialogShown = true;
			return dialog.show();
		}

		if ( ! this.frame ) {
			this.initFrame();
		}

		this.frame.open();

		// Set params to trigger sanitizer
		this.frame.uploader.uploader.param( 'uploadTypeCaller', 'elementor-editor-upload' );
		this.frame.uploader.uploader.param( 'upload_type', 'svg-icon' );

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
		const controlValue = this.getControlValue(),
			iconValue = controlValue.value,
			iconType = controlValue.library;

		if ( ! iconValue ) {
			this.ui.previewPlaceholder.html( '' );
			this.ui.frameOpeners.toggleClass( 'elementor-preview-has-icon', !! iconValue );
			return;
		}

		if ( 'svg' === iconType ) {
			return elementor.helpers.fetchInlineSvg( iconValue.url, ( data ) => {
				this.ui.previewPlaceholder.html( data );
				this.ui.frameOpeners.toggleClass( 'elementor-preview-has-icon', !! iconValue );
			} );
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
