const MAX_SCALE = 2;
const MIN_SCALE = 0.5;

export default class View extends Marionette.ItemView {
	getTemplate() {
		return '#tmpl-elementor-templates-responsive-bar';
	}

	id() {
		return 'e-responsive-bar';
	}

	ui() {
		const prefix = '#' + this.id();

		return {
			switcherInput: '.e-responsive-bar-switcher__option input',
			switcherLabel: '.e-responsive-bar-switcher__option',
			switcher: prefix + '-switcher',
			sizeInputWidth: prefix + '__input-width',
			sizeInputHeight: prefix + '__input-height',
			scaleValue: prefix + '-scale__value',
			scalePlusButton: prefix + '-scale__plus',
			scaleMinusButton: prefix + '-scale__minus',
			scaleResetButton: prefix + '-scale__reset',
			closeButton: prefix + '__close-button',
			breakpointSettingsButton: prefix + '__settings-button',
		};
	}

	events() {
		return {
			'change @ui.switcherInput': 'onBreakpointSelected',
			'input @ui.sizeInputWidth': 'onSizeInputChange',
			'input @ui.sizeInputHeight': 'onSizeInputChange',
			'click @ui.scalePlusButton': 'onScalePlusButtonClick',
			'click @ui.scaleMinusButton': 'onScaleMinusButtonClick',
			'click @ui.scaleResetButton': 'onScaleResetButtonClick',
			'click @ui.closeButton': 'onCloseButtonClick',
			'click @ui.breakpointSettingsButton': 'onBreakpointSettingsOpen',
		};
	}

	initialize() {
		this.listenTo( elementor.channels.deviceMode, 'change', this.onDeviceModeChange );
		this.listenTo( elementor.channels.responsivePreview, 'resize', this.onPreviewResize );
		this.listenTo( elementor.channels.responsivePreview, 'scale', this.onPreviewScale );
		this.listenTo( elementor.channels.responsivePreview, 'open', this.onPreviewOpen );
		this.listenTo( elementor.channels.deviceMode, 'close', this.resetScale );
	}

	addTipsyToIconButtons() {
		this.ui.switcherLabel.add( this.ui.closeButton ).add( this.ui.breakpointSettingsButton ).tipsy(
			{
				html: true,
				gravity: 'n',
				title() {
					return jQuery( this ).data( 'tooltip' );
				},
			},
		);
	}

	restoreLastValidPreviewSize() {
		const lastSize = elementor.channels.responsivePreview.request( 'size' );

		this.ui.sizeInputWidth
			.val( lastSize.width )
			.tipsy( {
				html: true,
				trigger: 'manual',
				gravity: 'n',
				title: () => __( 'The value inserted isn\'t in the breakpoint boundaries', 'elementor' ),
			} );

		const tipsy = this.ui.sizeInputWidth.data( 'tipsy' );

		tipsy.show();

		setTimeout( () => tipsy.hide(), 3000 );
	}

	resetScale() {
		elementor.setPreviewScale( 1 );
	}

	updateScalePercentageUI() {
		// Round the scale to the nearest 5, for better UX.
		const roundedTo5 = Math.round( elementor.getPreviewScale() * 100 / 5 ) * 5;

		this.scalePercentage = roundedTo5;
		this.ui.scaleValue.text( this.scalePercentage );
	}

	onRender() {
		this.addTipsyToIconButtons();
		this.updateScalePercentageUI();
	}

	onDeviceModeChange() {
		const currentDeviceMode = elementor.channels.deviceMode.request( 'currentMode' ),
			$currentDeviceSwitcherInput = this.ui.switcherInput.filter( '[value=' + currentDeviceMode + ']' );

		this.setWidthHeightInputsEditableState();

		this.ui.switcherLabel.attr( 'aria-selected', false );
		$currentDeviceSwitcherInput.closest( 'label' ).attr( 'aria-selected', true );

		if ( ! $currentDeviceSwitcherInput.prop( 'checked' ) ) {
			$currentDeviceSwitcherInput.prop( 'checked', true );
		}
	}

	onBreakpointSelected( e ) {
		const selectedDeviceMode = e.target.value;

		elementor.changeDeviceMode( selectedDeviceMode, false );
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
		if ( this.updatingPreviewSize ) {
			return;
		}

		const size = elementor.channels.responsivePreview.request( 'size' );

		this.ui.sizeInputWidth.val( Math.round( size.width ) );
		this.ui.sizeInputHeight.val( Math.round( size.height ) );
	}

	onPreviewScale() {
		this.updateScalePercentageUI();
	}

	onPreviewOpen() {
		this.setWidthHeightInputsEditableState();
	}

	setWidthHeightInputsEditableState() {
		const currentDeviceMode = elementor.channels.deviceMode.request( 'currentMode' );
		// TODO: disable inputs
		if ( 'desktop' === currentDeviceMode ) {
			this.ui.sizeInputWidth.attr( 'disabled', 'disabled' );
			this.ui.sizeInputHeight.attr( 'disabled', 'disabled' );
		} else {
			this.ui.sizeInputWidth.removeAttr( 'disabled' );
			this.ui.sizeInputHeight.removeAttr( 'disabled' );
		}
	}

	onCloseButtonClick() {
		elementor.changeDeviceMode( 'desktop' );
		// Force exit if device mode is already desktop
		elementor.exitDeviceMode();
	}

	onSizeInputChange() {
		clearTimeout( this.restorePreviewSizeTimeout );

		const size = {
			width: this.ui.sizeInputWidth.val(),
			height: this.ui.sizeInputHeight.val(),
		};

		const currentDeviceConstrains = elementor.getCurrentDeviceConstrains();

		if ( size.width < currentDeviceConstrains.minWidth || size.width > currentDeviceConstrains.maxWidth ) {
			this.restorePreviewSizeTimeout = setTimeout( () => this.restoreLastValidPreviewSize(), 1500 );

			return;
		}

		this.updatingPreviewSize = true;

		setTimeout( () => this.updatingPreviewSize = false, 300 );

		elementor.updatePreviewSize( size );
	}

	scalePreviewBy( percentage ) {
		let newScale = ( this.scalePercentage + percentage ) / 100;

		// Ensure the scaling is within the boundaries.
		newScale = Math.max( newScale, MIN_SCALE );
		newScale = Math.min( newScale, MAX_SCALE );

		elementor.setPreviewScale( newScale );
	}

	onScalePlusButtonClick() {
		this.scalePreviewBy( 10 );
	}

	onScaleMinusButtonClick() {
		this.scalePreviewBy( -10 );
	}

	onScaleResetButtonClick() {
		this.resetScale();
	}
}
