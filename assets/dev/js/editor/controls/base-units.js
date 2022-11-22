var ControlBaseMultipleItemView = require( 'elementor-controls/base-multiple' ),
	ControlBaseUnitsItemView;

ControlBaseUnitsItemView = ControlBaseMultipleItemView.extend( {

	ui() {
		return Object.assign( ControlBaseMultipleItemView.prototype.ui.apply( this, arguments ), {
			units: '.elementor-units-choices>input',
		} );
	},

	events() {
		return Object.assign( ControlBaseMultipleItemView.prototype.events.apply( this, arguments ), {
			'change @ui.units': 'onUnitChange',
		} );
	},

	updatePlaceholder() {
		const placeholder = this.getControlPlaceholder()?.unit;

		this.ui.units.removeClass( 'e-units-placeholder' );

		if ( placeholder !== this.getControlValue( 'unit' ) ) {
			this.ui.units.filter( `[value="${ placeholder }"]` )
				.addClass( 'e-units-placeholder' );
		}
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
		this.recursiveUnitChange( false );
		this.updatePlaceholder();
	},

	getCurrentRange() {
		return this.getUnitRange( this.getControlValue( 'unit' ) );
	},

	getUnitRange( unit ) {
		var ranges = this.model.get( 'range' );

		if ( ! ranges ) {
			return false;
		}

		if ( ! ranges[ unit ] ) {
			ranges[ unit ] = Object.values( ranges )[ 0 ];
		}

		return ranges[ unit ];
	},
} );

module.exports = ControlBaseUnitsItemView;
