export default class ColorPicker extends elementorModules.Module {
	constructor( ...args ) {
		super( ...args );

		this.createPicker();
	}

	getColorPickerPalette() {
		return _.pluck( elementor.schemes.getScheme( 'color-picker' ).items, 'value' );
	}

	getDefaultSettings() {
		return {
			picker: {
				theme: 'monolith',
				position: 'bottom-' + ( elementorCommon.config.isRTL ? 'end' : 'start' ),
				components: {
					opacity: true,
					hue: true,
					interaction: {
						input: true,
						clear: true,
					},
				},
				strings: {
					clear: elementor.translate( 'clear' ),
				},
			},
			classes: {
				active: 'elementor-active',
				swatchTool: 'elementor-color-picker__swatch-tool',
				swatchPlaceholder: 'elementor-color-picker__swatch-placeholder',
				addSwatch: 'elementor-color-picker__add-swatch',
				droppingArea: 'elementor-color-picker__dropping-area',
				plusIcon: 'eicon-plus',
				trashIcon: 'eicon-trash-o',
				dragToDelete: 'elementor-color-picker__dropping-area__drag-to-delete',
			},
			selectors: {
				swatch: '.pcr-swatch',
			},
		};
	}

	createPicker() {
		const pickerSettings = this.getSettings( 'picker' );

		pickerSettings.default = pickerSettings.default || null;

		this.picker = new Pickr( pickerSettings );

		if ( ! pickerSettings.default ) {
			// Set a default palette. It doesn't affect the selected value
			this.picker.setColor( '#000' );
		}

		this.color = this.processColor();

		this.picker
			.on( 'change', () => this.onPickerChange() )
			.on( 'clear', () => this.onPickerClear() )
			.on( 'show', () => this.onPickerShow() );

		this.addPlusButton();

		this.addSwatchDroppingArea();

		this.addToolsToSwatches();
	}

	processColor() {
		const color = this.picker.getColor();

		let colorRepresentation;

		if ( 1 === color.a ) {
			colorRepresentation = color.toHEXA();
		} else {
			colorRepresentation = color.toRGBA();
		}

		return colorRepresentation.toString( 0 );
	}

	getColor() {
		return this.color;
	}

	getSwatches() {
		return jQuery( this.picker.getRoot().swatches );
	}

	addSwatch( color ) {
		this.picker.addSwatch( color );
	}

	addSwatches() {
		const settings = this.getSettings();

		this.getSwatches().children( settings.selectors.swatch ).remove();

		this.picker._swatchColors = [];

		this.getColorPickerPalette().forEach( ( swatch ) => this.addSwatch( swatch ) );

		this.getSwatches().sortable( {
			items: '.pcr-swatch',
			placeholder: settings.classes.swatchPlaceholder,
			connectWith: this.$droppingArea,
			delay: 200,
			start: ( ...args ) => this.onSwatchesSortStart( ...args ),
			stop: () => this.onSwatchesSortStop(),
			update: ( ...args ) => this.onSwatchesSortUpdate( ...args ),
		} );

		this.addToolsToSwatches();
	}

	addPlusButton() {
		const { classes } = this.getSettings();

		this.$addButton = jQuery( '<button>', { class: classes.swatchTool + ' ' + classes.addSwatch } ).html( jQuery( '<i>', { class: classes.plusIcon } ) );

		this.$addButton.on( 'click', () => this.onAddButtonClick() );

		this.$addButton.tipsy( {
			title: () => elementor.translate( 'add_picked_color' ),
			gravity: () => 's',
		} );
	}

	addSwatchDroppingArea() {
		const { classes } = this.getSettings();

		this.$droppingArea = jQuery( '<div>', { class: classes.droppingArea } ).html( jQuery( '<i>', { class: classes.trashIcon } ) );

		this.getSwatches().after( this.$droppingArea );

		this.$droppingArea.sortable( {
			cancel: '.eicon-trash-o',
			placeholder: classes.swatchPlaceholder,
			over: () => this.onDroppingAreaOver(),
			out: () => this.onDroppingAreaOut(),
		} );

		if ( ! this.introductionViewed() ) {
			const $dragToDelete = jQuery( '<div>', { class: classes.dragToDelete } ).text( elementor.translate( 'drag_to_delete' ) );

			this.$droppingArea.append( $dragToDelete ).slideDown();

			elementorCommon.ajax.addRequest( 'introduction_viewed', {
				data: {
					introductionKey: 'colorPickerDropping',
				},
			} );

			ColorPicker.droppingIntroductionViewed = true;
		}
	}

	addToolsToSwatches() {
		this.getSwatches().append( this.$addButton );

		this.picker.activateSwatch();
	}

	destroy() {
		this.picker.destroyAndRemove();
	}

	fixTipsyForFF( $button ) {
		// There's a bug in FireFox about hiding the tooltip after the button was clicked,
		// So let's force it to hide
		$button.data( 'tipsy' ).hide();
	}

	introductionViewed() {
		return ColorPicker.droppingIntroductionViewed || elementor.config.user.introduction.colorPickerDropping;
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
		this.addSwatches();

		const { result: resultInput } = this.picker.getRoot().interaction;

		setTimeout( () => {
			resultInput.select();

			this.picker._recalc = true;
		}, 100 );
	}

	onAddButtonClick() {
		this.addSwatch( this.color );

		this.addToolsToSwatches();

		elementor.schemes.addSchemeItem( 'color-picker', { value: this.color } );

		elementor.schemes.saveScheme( 'color-picker' );

		this.fixTipsyForFF( this.$addButton );
	}

	onDroppingAreaOver() {
		this.$droppingArea.addClass( this.getSettings( 'classes.active' ) );
	}

	onDroppingAreaOut() {
		this.$droppingArea.removeClass( this.getSettings( 'classes.active' ) );
	}

	onSwatchesSortStart( event ) {
		this.sortedSwatchIndex = jQuery( event.srcElement ).index();

		this.$droppingArea.slideDown( () => this.$droppingArea.sortable( 'refresh' ) );
	}

	onSwatchesSortStop() {
		this.$droppingArea.slideUp();
	}

	onSwatchesSortUpdate( event ) {
		// Sample the scheme before removing
		const sortedScheme = elementor.schemes.getSchemeValue( 'color-picker', this.sortedSwatchIndex + 1 );

		elementor.schemes.removeSchemeItem( 'color-picker', this.sortedSwatchIndex );

		const $sortedSwatch = jQuery( event.srcElement );

		if ( $sortedSwatch.parent().is( this.$droppingArea ) ) {
			this.picker._swatchColors.splice( this.sortedSwatchIndex, 1 );

			$sortedSwatch.remove();
		} else {
			elementor.schemes.addSchemeItem( 'color-picker', sortedScheme, $sortedSwatch.index() );
		}

		elementor.schemes.saveScheme( 'color-picker' );
	}
}
