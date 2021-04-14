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
			scaleButton: prefix + '__button-scale',
			scaleInput: prefix + '__input-scale',
			switcher: prefix + '-switcher',
			sizeInputWidth: prefix + '__input-width',
			sizeInputHeight: prefix + '__input-height',
			closeButton: prefix + '__close-button',
			breakpointSettingsButton: prefix + '__settings-button',
		};
	}

	events() {
		return {
			'change @ui.switcherInput': 'onBreakpointSelected',
			'input @ui.sizeInputWidth': 'onSizeInputChange',
			'input @ui.sizeInputHeight': 'onSizeInputChange',
			'click @ui.closeButton': 'onCloseButtonClick',
			'click @ui.breakpointSettingsButton': 'onBreakpointSettingsOpen',
			'mousedown @ui.scaleButton': 'onScaleButtonMousedown',
			'keydown @ui.scaleButton': 'onScaleButtonMousedown',
			'mouseup @ui.scaleButton': 'onScaleButtonMouseup',
			'keyup @ui.scaleButton': 'onScaleButtonMouseup',
			'mouseout @ui.scaleButton': 'onScaleButtonMouseup',
			'input @ui.scaleInput': 'onScaleInputChange',
		};
	}

	initialize() {
		this.listenTo( elementor.channels.deviceMode, 'change', this.onDeviceModeChange );
		this.listenTo( elementor.channels.responsivePreview, 'resize', this.onPreviewResize );

		this.scale = 100;
		this.isScalingPreview = false;
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

	incrementScale( increment = 1, speed = 0 ) {
		const incrementedScale = parseInt( this.ui.scaleInput.val() ) + increment;
		const scale = Math.round( incrementedScale * 1000 ) / 1000;
		const delay = 1 > speed ? 500 : 120 - ( speed * 1.5 );

		setTimeout( () => {
			if ( ! this.isScalingPreview ) {
				return;
			}

			this.incrementScale( increment, speed += 1 );
		}, delay );

		this.updateScale( scale );
	}

	onScaleButtonMousedown( e ) {
		this.isScalingPreview = true;

		const increment = jQuery( e.target.closest( 'button' ) ).is( '#scaleUp' ) ? 1 : -1;

		this.incrementScale( increment );
	}

	onScaleButtonMouseup() {
		this.isScalingPreview = false;
	}

	onDeviceModeChange() {
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
	}

	onRender() {
		this.addTipsyToIconButtons();
	}

	onCloseButtonClick() {
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

	isScaleUpToDate( scale ) {
		if ( scale !== this.scale ) {
			return false;
		}

		if ( scale !== this.ui.scaleInput.val() ) {
			return false;
		}

		if ( scale !== elementorCommon.elements.$body.css( '--e-editor-preview-scale' ) ) {
			return false;
		}

		return true;
	}

	isValidScale( scale ) {
		if ( NaN === parseFloat( scale ) ) {
			return false;
		}

		if ( 25 > scale || 200 < scale ) {
			return;
		}

		return true;
	}

	updateScale( scale, changed = false ) {
		if ( ! this.isValidScale( scale ) || this.isScaleUpToDate( scale ) ) {
			return;
		}

		this.scale = scale;
		this.ui.scaleInput.val( this.scale );
		elementorCommon.elements.$body.css( '--e-editor-preview-scale', this.scale );

		if ( parseFloat( scale ) !== parseFloat( this.ui.scaleInput.val() ) && ! changed ) {
			this.ui.scaleInput.trigger( 'change' );
		}
	}

	onScaleInputChange() {
		const scale = this.ui.scaleInput.val();

		if ( this.isScaleUpToDate( scale ) ) {
			return;
		}

		if ( ! this.isValidScale( scale ) ) {
			// We wait 1.5s, and we reset it to the active scale
			setTimeout( () => {
				this.ui.scaleInput.val( this.scale );
			}, 1500 );
			return;
		}

		this.updateScale( scale, true );
	}
}
