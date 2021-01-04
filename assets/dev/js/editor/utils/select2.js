export default class Select2 extends elementorModules.ViewModule {
	getDefaultSettings() {
		return {
			classes: {
				allSelected: 'select2-container--all-selected',
			},
		};
	}

	toggleAllSelectedClass() {
		this.select2.dataAdapter.query( {}, ( data ) => {
			const allSelectedClass = this.getSettings( 'classes.allSelected' ),
				totalOptionsCount = data.results.length,
				currentSelectionsCount = this.elements.$element.select2( 'data' ).length;

			if ( currentSelectionsCount === totalOptionsCount ) {
				this.state.isAllSelected = true;
				this.elements.$container.addClass( allSelectedClass );
			} else if ( this.state.isAllSelected ) {
				this.state.isAllSelected = false;
				this.elements.$container.removeClass( allSelectedClass );
			}
		} );
	}

	addAllSelectedIndication() {
		this.toggleAllSelectedClass();

		this.select2.on( 'select', () => this.toggleAllSelectedClass() );

		this.select2.on( 'unselect', () => this.toggleAllSelectedClass() );
	}

	extendBaseFunctionality() {
		const config = this.select2.options.options;

		if ( config.multiple ) {
			this.addAllSelectedIndication();
		}
	}

	iniElements() {
		this.elements.$element = this.select2.$element;
		this.elements.$container = this.select2.$container;
	}

	destroy() {
		this.elements.$element.select2( 'destroy' );
	}

	onInit( ...args ) {
		super.onInit( ...args );

		const { $element, options } = this.getSettings();

		this.select2 = $element.select2( options ).data( 'select2' );

		this.state = {
			isAllSelected: false,
		};

		this.iniElements();
		this.extendBaseFunctionality();
	}
}
