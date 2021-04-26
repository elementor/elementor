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
			switcherInput: prefix + '-switcher__option input',
			switcherLabel: prefix + '-switcher__option',
			switcher: prefix + '-switcher',
			sizeInputWidth: prefix + '__input-width',
			sizeInputHeight: prefix + '__input-height',
			scaleValue: prefix + '-scale__value span',
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
			'click @ui.scalePlusButton': 'onPlusClick',
			'click @ui.scaleMinusButton': 'onMinusClick',
			'click @ui.scaleResetButton': 'onResetClick',
			'click @ui.closeButton': 'onCloseButtonClick',
			'click @ui.breakpointSettingsButton': 'onBreakpointSettingsOpen',
		};
	}

	initialize() {
		// I can't select the elements below from the ui() method
		this.elementorPreview = jQuery( '#elementor-preview' );
		this.elementorPreviewWrapper = jQuery( '#elementor-preview-responsive-wrapper' );
		this.previewIframe = jQuery( '#elementor-preview-iframe' );

		this.setScalePresentage();

		this.listenTo( elementor.channels.deviceMode, 'change', this.onDeviceModeChange );
		this.listenTo( elementor.channels.responsivePreview, 'resize', this.onPreviewResize );
		this.listenTo( elementor.channels.deviceMode, 'close', this.resetScale );
	}

	addTipsyToIconButtons() {
		this.ui.switcherLabel.add( this.ui.closeButton ).add( this.ui.breakpointSettingsButton ).tipsy(
			{
				gravity: 'n',
				title() {
					return jQuery( this ).data( 'tooltip' );
				},
			}
		);
	}

	restoreLastValidPreviewSize() {
		const lastSize = elementor.channels.responsivePreview.request( 'size' );

		this.ui.sizeInputWidth
			.val( lastSize.width )
			.tipsy( {
				trigger: 'manual',
				gravity: 'n',
				title: () => __( 'The value inserted isn\'t in the breakpoint boundaries', 'elementor' ),
			} );

		const tipsy = this.ui.sizeInputWidth.data( 'tipsy' );

		tipsy.show();

		setTimeout( () => tipsy.hide(), 3000 );
	}

	onDeviceModeChange() {
		// I can't select jQuery( .ui-resizable- ) when preview is loaded, because it's generated dynamically from jQueryUi-resaizable()
		this.previewRightHandle = jQuery( '#elementor-preview-responsive-wrapper .ui-resizable-e' );
		this.previewLeftHandle = jQuery( '#elementor-preview-responsive-wrapper .ui-resizable-w' );
		this.previewBottomHandle = jQuery( '#elementor-preview-responsive-wrapper .ui-resizable-s' );

		const currentDeviceMode = elementor.channels.deviceMode.request( 'currentMode' ),
			$currentDeviceSwitcherInput = this.ui.switcherInput.filter( '[value=' + currentDeviceMode + ']' );

		this.ui.switcherLabel.attr( 'aria-selected', false );
		$currentDeviceSwitcherInput.closest( 'label' ).attr( 'aria-selected', true );

		if ( ! $currentDeviceSwitcherInput.prop( 'checked' ) ) {
			$currentDeviceSwitcherInput.prop( 'checked', true );
		}
	}

	onBreakpointSelected( e ) {
		const currentDeviceMode = elementor.channels.deviceMode.request( 'currentMode' ),
			selectedDeviceMode = e.target.value;

		if ( currentDeviceMode !== selectedDeviceMode ) {
			elementor.changeDeviceMode( selectedDeviceMode, false );
		}
	}

	isDesktopDevice() {
		const currentDeviceMode = elementor.channels.deviceMode.request( 'currentMode' );
		return 'desktop' === currentDeviceMode;
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

		this.ui.sizeInputWidth.val( size.width );
		this.ui.sizeInputHeight.val( size.height );

		this.scalePreview();
	}

	onRender() {
		this.addTipsyToIconButtons();
	}

	onCloseButtonClick() {
		elementor.changeDeviceMode( 'desktop' );
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
		this.autoScale();
	}

	// isInDeviceConstraints( width ) {
	// 	const currentDeviceConstrains = elementor.getCurrentDeviceConstrains();
	// 	return width <= currentDeviceConstrains.maxWidth && width >= currentDeviceConstrains.minWidth;
	// }

	autoScale() {
		const handlesWidth = 40,
			previewWidth = this.elementorPreview.width() - handlesWidth,
			iframeScaleWidth = this.ui.sizeInputWidth.val() * this.scalePresentage / 100;

		if ( iframeScaleWidth > previewWidth ) {
			const scalePresentage = previewWidth / this.ui.sizeInputWidth.val() * 100;

			this.setScalePresentage( scalePresentage );
		}

		this.scalePreview();
	}

	// autoResize() {
	// 	const handlesWidth = 40,
	// 		previewWidth = this.elementorPreview.width() - handlesWidth,
	// 		iframeScaleWidth = this.ui.sizeInputWidth.val() * this.scalePresentage / 100;
	// 		//resizeIframeTo = Math.floor( previewWidth - ( ( previewWidth / 100 * this.scalePresentage ) - previewWidth ) ); // TODO: Works but still need ajust
	// 		//isInDeviceConstraints = this.isInDeviceConstraints( resizeIframeTo ); // TODO: should I resize Iframe only if in device constraints

	// 	if ( iframeScaleWidth > previewWidth ) {
	// 		const resizeIframeTo = Math.floor( previewWidth - ( ( previewWidth / 100 * this.scalePresentage ) - previewWidth ) ); // TODO: Works but still need ajust

	// 		this.ui.sizeInputWidth.val( resizeIframeTo );

	// 		const size = {
	// 			width: resizeIframeTo,
	// 			height: this.ui.sizeInputHeight.val(),
	// 		};

	// 		elementor.updatePreviewSize( size );
	// 	}
	// 	//this.scalePreview();
	// }

	scalePreview() {
		const scale = this.scalePresentage / 100;
		this.previewIframe.css( 'transform', 'scale(' + ( scale ) + ')' );
		this.elementorPreviewWrapper.removeClass( 'elementor-preview-responsive-wrapper--scrollable' );

		if ( this.isDesktopDevice() ) {
			// Make elementorPreviewWrapper scrollable
			if ( this.scalePresentage > 100 ) {
				this.elementorPreviewWrapper.addClass( 'elementor-preview-responsive-wrapper--scrollable' );
			}
			return;
		}

		this.handleUiResizableHandles();
	}

	handleUiResizableHandles() {
		const previewSize = elementor.channels.responsivePreview.request( 'size' ),
			translateLeftRightHandle = ( ( previewSize.width / 2 ) * ( ( this.scalePresentage / 100 ) - 1 ) ),
			translateTopHandle = ( ( previewSize.height / 2 ) * ( ( this.scalePresentage / 100 ) - 1 ) ),
			translateBottomHandle = ( ( previewSize.height ) * ( ( this.scalePresentage / 100 ) - 1 ) );

		this.previewLeftHandle.css( 'transform', 'translate( ' + -translateLeftRightHandle + 'px, ' + translateTopHandle + 'px )' );
		this.previewRightHandle.css( 'transform', 'translate( ' + translateLeftRightHandle + 'px, ' + translateTopHandle + 'px )' );
		this.previewBottomHandle.css( 'transform', 'translate( 0,' + translateBottomHandle + 'px )' );
	}

	scalePreviewDesktop() {
		const scale = this.scalePresentage / 100;
		this.previewIframe.css( 'transform', 'scale(' + ( scale ) + ')' );
	}

	onPlusClick() {
		const scaleUp = 0 === this.scalePresentage % 10 ? this.scalePresentage + 10 : Math.ceil( this.scalePresentage / 10 ) * 10,
			scalePresentage = scaleUp > 200 ? 200 : scaleUp;

		this.setScalePresentage( scalePresentage );
		// this.autoResize();
		this.scalePreview();
	}

	onMinusClick() {
		const scaleDown = 0 === this.scalePresentage % 10 ? this.scalePresentage - 10 : Math.floor( this.scalePresentage / 10 ) * 10,
			scalePresentage = scaleDown < 50 ? 50 : scaleDown;

		this.setScalePresentage( scalePresentage );
		//this.autoResize();
		this.scalePreview();
	}

	onResetClick() {
		this.resetScale();
	}

	resetScale() {
		this.setScalePresentage();
		// this.autoResize();
		this.scalePreview();
	}

	setScalePresentage( scalePresentage = 100 ) {
		this.scalePresentage = scalePresentage;
		if ( this.ui.scaleValue ) {
			this.ui.scaleValue.text( parseInt( this.scalePresentage ) );
		}
	}
}
