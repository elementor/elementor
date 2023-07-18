export default class ColorPicker extends elementorModules.Module {
	constructor( ...args ) {
		super( ...args );

		this.createPicker();
	}

	getDefaultSettings() {
		return {
			picker: {
				theme: 'monolith',
				position: 'bottom-middle',
				components: {
					opacity: true,
					hue: true,
					interaction: {
						input: true,
						hex: true,
						rgba: true,
						hsla: true,
					},
				},
			},
			classes: {
				active: 'elementor-active',
				pickerHeader: 'elementor-color-picker__header',
				pickerToolsContainer: 'e-color-picker__tools',
				pickerTool: 'e-control-tool',
				clearButton: 'e-color-picker__clear',
				plusIcon: 'eicon-plus',
			},
		};
	}

	createPicker() {
		const pickerSettings = this.getSettings( 'picker' );

		pickerSettings.default = pickerSettings.default || null;

		this.picker = new Pickr( pickerSettings );

		// Set a default palette. It doesn't affect the selected value.
		this.picker.setColor( pickerSettings.default || '#020101' );

		this.color = this.processColor();

		this.picker
			.on( 'change', () => this.onPickerChange() )
			.on( 'clear', () => this.onPickerClear() )
			.on( 'show', () => this.onPickerShow() );

		this.$pickerAppContainer = jQuery( this.picker.getRoot().app );

		this.createPickerHeader();
	}

	addTipsyToClearButton() {
		this.$clearButton.tipsy( {
			title: () => __( 'Clear', 'elementor' ),
			gravity: () => 's',
		} );
	}

	processColor() {
		const color = this.picker.getColor();

		let colorRepresentation;

		if ( 1 === color.a ) {
			colorRepresentation = color.toHEXA();
		} else {
			colorRepresentation = color.toRGBA();
		}

		return colorRepresentation.toString();
	}

	getColor() {
		return this.color;
	}

	createPickerHeader() {
		const { classes } = this.getSettings(),
			$pickerHeader = jQuery( '<div>', { class: classes.pickerHeader } )
				.text( __( 'Color Picker', 'elementor' ) ),
			$pickerToolsContainer = jQuery( '<div>', { class: classes.pickerToolsContainer } ),
			addButton = this.getSettings( 'addButton' );

		this.$pickerToolsContainer = $pickerToolsContainer;

		if ( addButton ) {
			this.createAddButton();
		}

		this.createClearButton();

		$pickerToolsContainer.append( this.$clearButton, this.$addButton );

		$pickerHeader.append( $pickerToolsContainer );

		this.$pickerAppContainer.prepend( $pickerHeader );
	}

	createAddButton() {
		const { classes } = this.getSettings();

		this.$addButton = jQuery( '<button>', { class: classes.pickerTool } ).html( jQuery( '<i>', { class: classes.plusIcon } ) );

		this.$addButton.on( 'click', () => this.onAddButtonClick() );

		this.$addButton.tipsy( {
			title: () => __( 'Create New Global Color', 'elementor' ),
			gravity: () => 's',
		} );
	}

	// Move the clear button from Pickr's default location into the Color Picker header.
	createClearButton() {
		const { classes } = this.getSettings();

		this.$clearButton = jQuery( '<div>', { class: classes.clearButton + ' ' + classes.pickerTool } )
			.html( '<i class="eicon-undo"></i>' );

		this.$clearButton.on( 'click', () => this.picker._clearColor() );

		this.addTipsyToClearButton();
	}

	destroy() {
		this.picker.destroyAndRemove();
	}

	// TODO: CHECK IF THIS IS STILL NECESSARY
	fixTipsyForFF( $button ) {
		// There's a bug in FireFox about hiding the tooltip after the button was clicked,
		// So let's force it to hide.
		$button.data( 'tipsy' ).hide();
	}

	introductionViewed() {
		return ColorPicker.droppingIntroductionViewed || elementor.config.user.introduction.colorPickerDropping;
	}

	toggleClearButtonState( active ) {
		this.$clearButton.toggleClass( 'e-control-tool-disabled', ! active );
	}

	onPickerChange() {
		this.picker.applyColor();

		const newColor = this.processColor();

		if ( newColor === this.color ) {
			return;
		}

		this.color = newColor;

		const onChange = this.getSettings( 'onChange' );

		if ( onChange ) {
			onChange();
		}
	}

	onPickerClear() {
		this.color = '';

		const onClear = this.getSettings( 'onClear' );

		if ( onClear ) {
			onClear();
		}
	}

	onPickerShow() {
		const { result: resultInput } = this.picker.getRoot().interaction;

		setTimeout( () => {
			resultInput.select();
		}, 100 );

		const onShow = this.getSettings( 'onShow' );

		if ( onShow ) {
			onShow();
		}
	}

	onAddButtonClick() {
		this.picker.hide();

		const onPickerAddButtonClick = this.getSettings( 'onAddButtonClick' );

		if ( onPickerAddButtonClick ) {
			onPickerAddButtonClick();
		}

		this.fixTipsyForFF( this.$addButton );
	}
}
