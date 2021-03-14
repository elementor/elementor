export default class View extends Marionette.ItemView {
	getTemplate() {
		return '#tmpl-elementor-templates-responsive-bar';
	}

	className() {
		return 'e-responsive-bar';
	}

	ui() {
		const prefix = '.' + this.className();

		return {
			switcherOption: prefix + '-switcher__option',
			switcherLabel: prefix + '-switcher__label',
			switcher: prefix + '-switcher',
			sizeInput: prefix + '__input-size',
			closeButton: prefix + '__close-button',
			breakpointSettingsButton: prefix + '__settings-button',
		};
	}

	events() {
		return {
			'change @ui.switcherOption': 'onBreakpointSelected',
			'change @ui.sizeInput': 'onSizeInputChange',
			'click @ui.closeButton': 'onCloseButtonClick',
			'click @ui.breakpointSettingsButton': 'onBreakpointSettingsOpen',
		};
	}

	initialize() {
		this.listenTo( elementor.channels.deviceMode, 'change', this.onDeviceModeChange );
		this.listenTo( elementor.channels.responsivePreview, 'resize', this.onPreviweResize );
	}

	addTipsyToIconButtons() {
		this.ui.switcherLabel.add( this.ui.closeButton ).add( this.ui.breakpointSettingsButton ).tipsy(
			{
				gravity: 'n',
				offset: 10,
				title() {
					return jQuery( this ).data( 'tooltip' );
				},
			}
		);
	}

	onDeviceModeChange() {
		const currentDeviceMode = elementor.channels.deviceMode.request( 'currentMode' ),
			$currentDeviceSwitcherOption = this.ui.switcherOption.filter( '[value=' + currentDeviceMode + ']' );

		if ( ! $currentDeviceSwitcherOption.prop( 'checked' ) ) {
			$currentDeviceSwitcherOption.prop( 'checked', true );
		}
	}

	onBreakpointSelected( e ) {
		const currentDeviceMode = elementor.channels.deviceMode.request( 'currentMode' ),
			selectedDeviceMode = e.target.value;

		if ( currentDeviceMode !== selectedDeviceMode ) {
			elementor.changeDeviceMode( selectedDeviceMode );
		}
	}

	onBreakpointSettingsOpen() {
		const isWPPreviewMode = elementorCommon.elements.$body.hasClass( 'elementor-editor-preview' );

		if ( isWPPreviewMode ) {
			// Exit Preview Mode
			elementor.panel.$el.find( '#elementor-mode-switcher-preview-input' ).trigger( 'click' );
		}

		const isInSettingsPanelActive = 'panel/global/menu' === elementor.documents.currentDocument.config.panel.default_route;

		if ( isInSettingsPanelActive ) {
			// Shake the panel
			_( 6 ).times( ( n ) => {
				_.delay( () => {
						elementor.panel.$el.css( 'transform', 'translateX(' + ( ( ( n + 1 ) % 2 ) * 5 ) + 'px)' );
					}, n * 70 );
			} );

			return;
		}

		//  Open Settings Panel for Global/Layout/Breakpoints Settings
		$e.run( 'editor/documents/switch', {
			id: elementor.config.kit_id,
			mode: 'autosave',
		} )
			.then( () => $e.route( 'panel/global/settings-layout' ) )
			// TODO: Replace with a standard routing solution once one is available
			.then( () => jQuery( '.elementor-control-section_breakpoints' ).trigger( 'click' ) );
	}

	onPreviweResize() {
		const width = elementor.channels.responsivePreview.request( 'width' );
		const height = elementor.channels.responsivePreview.request( 'height' );

		this.ui.sizeInput.filter( '.e-responsive-bar__input-width' ).val( width );
		this.ui.sizeInput.filter( '.e-responsive-bar__input-height' ).val( height );
	}

	onRender() {
		this.addTipsyToBreakpointSwitch();
	}

	onCloseButtonClick() {
		elementor.exitDeviceMode();
	}

	onSizeInputChange() {
		const size = {
			width: this.ui.sizeInput.filter( '.e-responsive-bar__input-width' ).val(),
			height: this.ui.sizeInput.filter( '.e-responsive-bar__input-height' ).val(),
		};

		elementor.updatePreviewSize( size );
	}

	onFlipButtonClick() {
		elementor.togglePreviewOrientation();
	}
}
