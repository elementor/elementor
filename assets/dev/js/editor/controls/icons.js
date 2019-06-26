const ControlMultipleBaseItemView = require( 'elementor-controls/base-multiple' );

class ControlIconsView extends ControlMultipleBaseItemView {
	constructor( ...args ) {
		super( ...args );
		this.cache = {
			loaded: false,
			dialog: false,
			enableClicked: false,
			fa4Mapping: false,
			migratedFlag: {},
		};
		this.dataKeys = {
			migratedKey: '__fa4_migrated',
			fa4MigrationFlag: 'fa4compatibility',
		};
	}

	enqueueIconFonts( iconType ) {
		const iconSetting = elementor.helpers.getIconLibrarySettings( iconType );
		if ( false === iconSetting || ! this.isMigrationAllowed() ) {
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

		ui.svgUploader = '.elementor-control-svg-uploader';
		ui.iconPickers = '.elementor-control-icon-picker, .elementor-control-media__preview, .elementor-control-media-upload-button';
		ui.deleteButton = '.elementor-control-media__remove';
		ui.previewPlaceholder = '.elementor-control-media__preview';
		ui.previewContainer = '.elementor-control-preview-area';

		return ui;
	}

	events() {
		return jQuery.extend( ControlMultipleBaseItemView.prototype.events.apply( this, arguments ), {
			'click @ui.iconPickers': 'openPicker',
			'click @ui.svgUploader': 'openFrame',
			'click @ui.deleteButton': 'deleteIcon',
		} );
	}

	getControlValue() {
		const value = super.getControlValue(),
			model = this.model,
			valueToMigrate = this.getValueToMigrate();

		if ( ! this.isMigrationAllowed() ) {
			return valueToMigrate;
		}

		// Bail if no migration flag or no value to migrate
		if ( ! valueToMigrate ) {
			return value;
		}

		const didMigration = this.elementSettingsModel.get( this.dataKeys.migratedKey ),
			controlName = model.get( 'name' );

		// Check if migration had been done and is stored locally
		if ( this.cache.migratedFlag[ controlName ] ) {
			return this.cache.migratedFlag[ controlName ];
		}
		// Check if already migrated
		if ( didMigration && didMigration[ controlName ] ) {
			return value;
		}

		// Do migration
		return this.migrateFa4toFa5( valueToMigrate );
	}

	migrateFa4toFa5( fa4Value ) {
		const fa5Value = elementor.helpers.mapFa4ToFa5( fa4Value );
		this.cache.migratedFlag[ this.model.get( 'name' ) ] = fa5Value;
		this.enqueueIconFonts( fa5Value.library );
		return fa5Value;
	}

	setControlAsMigrated( controlName ) {
		const didMigration = this.elementSettingsModel.get( this.dataKeys.migratedKey ) || {};
		didMigration[ controlName ] = true;
		this.elementSettingsModel.set( this.dataKeys.migratedKey, didMigration, { silent: true } );
	}

	isMigrationAllowed() {
		return ! ElementorConfig[ 'icons_update_needed' ];
	}

	getValueToMigrate() {
		const controlToMigrate = this.model.get( this.dataKeys.fa4MigrationFlag );
		if ( ! controlToMigrate ) {
			return false;
		}

		// Check if there is a value to migrate
		const valueToMigrate = this.elementSettingsModel.get( controlToMigrate );
		if ( valueToMigrate ) {
			return valueToMigrate;
		}
		return false;
	}

	onReady() {
		// is migration allowed from fa4
		if ( ! this.isMigrationAllowed() ) {
			this.ui.previewContainer[ 0 ].addEventListener( 'click', ( event ) => {
				event.stopPropagation();
				const onConfirm = () => {
					window.location.href = ElementorConfig.tools_page_link + '#tab-fontawesome4_migration';
				};
				const enableMigrationDialog = elementor.helpers.getSimpleDialog(
					'elementor-enable-fa5-dialog',
					elementor.translate( 'enable_fa5' ),
					elementor.translate( 'dialog_confirm_enable_fa5' ),
					elementor.translate( 'update' ),
					onConfirm
				);
				enableMigrationDialog.show();
				return false;
			}, true );
		}

		const controlName = this.model.get( 'name' );
		if ( this.cache.migratedFlag[ controlName ] ) {
			this.setControlAsMigrated( controlName );
			setTimeout( () => {
				this.setValue( this.cache.migratedFlag[ controlName ] );
			}, 10 );
		}
	}

	onRender() {
		super.onRender();
		// @todo: move to manager
		if ( ! this.cache.loaded && this.isMigrationAllowed() ) {
			elementor.config.icons.forEach( ( library ) => {
				if ( 'all' === library.name ) {
					return;
				}
				elementor.iconManager.library.initIconType( library );
			} );
			this.cache.loaded = true;
		}
	}

	initFrame() {
		// Set current doc id to attach uploaded images.
		wp.media.view.settings.post.id = elementor.config.document.id;
		this.frame = wp.media( {
			button: {
				text: elementor.translate( 'insert_media' ),
			},
			library: { type: [ 'image/svg+xml' ] },
			states: [
				new wp.media.controller.Library( {
					title: elementor.translate( 'insert_media' ),
					library: wp.media.query( { type: [ 'image/svg+xml' ] } ),
					multiple: false,
					date: false,
				} ),
			],
		} );

		const handleSelect = () => this.selectSvg();

		// When a file is selected, run a callback.
		this.frame.on( 'insert select', handleSelect );

		this.setUploadMimeType( this.frame, 'svg' );
	}

	setUploadMimeType( frame, ext ) {
		// Set svg as only allowed upload extensions
		const oldExtensions = _wpPluploadSettings.defaults.filters.mime_types[ 0 ].extensions;
		frame.on( 'ready', () => {
			_wpPluploadSettings.defaults.filters.mime_types[ 0 ].extensions = ext;
		} );

		this.frame.on( 'close', () => {
			// restore allowed upload extensions
			_wpPluploadSettings.defaults.filters.mime_types[ 0 ].extensions = oldExtensions;
		} );
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
		const onConfirm = () => {
			elementorCommon.ajax.addRequest( 'enable_svg_uploads', {}, true );
		};
		return elementor.helpers.getSimpleDialog(
			'elementor-enable-svg-dialog',
			elementor.translate( 'enable_svg' ),
			elementor.translate( 'dialog_confirm_enable_svg' ),
			elementor.translate( 'enable' ),
			onConfirm
		);
	}

	isSvgEnabled() {
		if ( ! this.cache.enableClicked ) {
			return this.model.get( 'is_svg_enabled' );
		}
		return true;
	}

	openFrame() {
		if ( ! this.isSvgEnabled() && ! elementor.iconManager.cache.svgDialogShown ) {
			const dialog = this.getSvgNotEnabledDialog();
			elementor.iconManager.cache.svgDialogShown = true;
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
		const controlValue = this.getControlValue();
		let iconValue = controlValue.value,
			iconType = controlValue.library;

		if ( ! this.isMigrationAllowed() && ! iconValue && this.getValueToMigrate() ) {
			iconValue = this.getControlValue();
			iconType = '';
		}

		this.$el.toggleClass( 'elementor-media-empty', ! iconValue );

		if ( ! iconValue ) {
			this.ui.previewPlaceholder.html( '' );
			return;
		}

		if ( 'svg' === iconType ) {
			return elementor.helpers.fetchInlineSvg( iconValue.url, ( data ) => {
				this.ui.previewPlaceholder.html( data );
			} );
		}

		const previewHTML = '<i class="' + iconValue + '"></i>';
		this.ui.previewPlaceholder.html( previewHTML );
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
