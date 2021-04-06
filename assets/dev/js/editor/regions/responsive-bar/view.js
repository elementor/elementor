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
			sizeInputWidth: prefix + '__input-width',
			sizeInputHeight: prefix + '__input-height',
			closeButton: prefix + '__close-button',
			breakpointSettingsButton: prefix + '__settings-button',
		};
	}

	events() {
		return {
			'change @ui.switcherOption': 'onBreakpointSelected',
			'change @ui.sizeInputWidth': 'onSizeInputChange',
			'change @ui.sizeInputHeight': 'onSizeInputChange',
			'click @ui.closeButton': 'onCloseButtonClick',
			'click @ui.breakpointSettingsButton': 'onBreakpointSettingsOpen',
		};
	}

	initialize() {
		this.listenTo( elementor.channels.deviceMode, 'change', this.onDeviceModeChange );
		this.listenTo( elementor.channels.responsivePreview, 'resize', this.onPreviewResize );
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
			elementor.exitPreviewMode();
		}

		const isInSettingsPanelActive = 'panel/global/menu' === elementor.documents.currentDocument.config.panel.default_route;

		if ( isInSettingsPanelActive ) {
			$e.run( 'panel/global/close' );

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

	onPreviewResize() {
		const size = elementor.channels.responsivePreview.request( 'size' );

		this.ui.sizeInputWidth.val( size.width );
		this.ui.sizeInputHeight.val( size.height );
	}

	onRender() {
		this.addTipsyToIconButtons();
	}

	onCloseButtonClick() {
		elementor.exitDeviceMode();
	}

	onSizeInputChange() {
		const size = {
			width: this.ui.sizeInputWidth.val(),
			height: this.ui.sizeInputHeight.val(),
		};

		elementor.updatePreviewSize( size );
	}
}
