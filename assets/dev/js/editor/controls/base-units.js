var ControlBaseMultipleItemView = require( 'elementor-controls/base-multiple' ),
	ControlBaseUnitsItemView;

ControlBaseUnitsItemView = ControlBaseMultipleItemView.extend( {

	ui() {
		return Object.assign( ControlBaseMultipleItemView.prototype.ui.apply( this, arguments ), {
			units: '.e-units-choices>input',
			unitSwitcher: '.e-units-switcher',
			unitChoices: '.e-units-choices',
		} );
	},

	events() {
		return Object.assign( ControlBaseMultipleItemView.prototype.events.apply( this, arguments ), {
			'change @ui.units': 'onUnitChange',
			'click @ui.unitSwitcher': 'onUnitLabelClick',
		} );
	},

	updatePlaceholder() {
		const placeholder = this.getControlPlaceholder()?.unit;

		this.ui.units.removeClass( 'e-units-placeholder' );

		if ( placeholder !== this.getControlValue( 'unit' ) ) {
			this.ui.units.filter( `[value="${ placeholder }"]` )
				.addClass( 'e-units-placeholder' );
		}

		this.ui.unitSwitcher.html( this.getControlValue( 'unit' ) );

		this.$el.toggleClass( 'e-units-custom', this.isCustomUnit() );
	},

	recursiveUnitChange( includingSelf = true ) {
		const parent = this.getResponsiveParentView();

		if ( parent && includingSelf ) {
			const unit = parent.getControlValue( 'unit' ),
				values = Object.keys( this.getCleanControlValue() || {} );

			// Remove `unit` from values, so only control values are indicated.
			values.splice( values.indexOf( 'unit' ), 1 );

			// Only set the unit when no control values are already specified.
			if ( unit && ! values.length ) {
				this.setValue( 'unit', unit );
				this.render();
			}
		}

		for ( const child of this.getResponsiveChildrenViews() ) {
			child.recursiveUnitChange();
		}
	},

	onRender() {
		ControlBaseMultipleItemView.prototype.onRender.apply( this, arguments );

		this.updatePlaceholder();
	},

	onUnitChange() {
		this.ui.unitChoices.removeClass( 'e-units-choices-open' );

		this.recursiveUnitChange( false );
		this.updatePlaceholder();
	},

	onUnitLabelClick( event ) {
		event.preventDefault();

		this.ui.unitChoices.toggleClass( 'e-units-choices-open' );
	},

	getCurrentRange() {
		return this.getUnitRange( this.getControlValue( 'unit' ) );
	},

	getUnitRange( unit ) {
		var ranges = this.model.get( 'range' );

		if ( ! ranges || ! ranges[ unit ] ) {
			return false;
		}

		return ranges[ unit ];
	},

	isCustomUnit() {
		return 'custom' === this.getControlValue( 'unit' );
	},
}, {
	// Static methods
	getStyleValue( placeholder, controlValue ) {
		let returnValue = ControlBaseMultipleItemView.getStyleValue( placeholder, controlValue );

		if ( 'UNIT' === placeholder && 'custom' === returnValue ) {
			returnValue = '__EMPTY__';
		}

		return returnValue;
	},
} );

module.exports = ControlBaseUnitsItemView;
