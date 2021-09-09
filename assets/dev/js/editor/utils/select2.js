export default class Select2 extends elementorModules.ViewModule {
	getDefaultSettings() {
		return {
			selectors: {
				plusButton: '.select2-selection__e-plus-button',
				// The select2InlineSearch selector can not be changed.
				select2InlineSearch: '.select2-selection__rendered .select2-search--inline',
			},
			classes: {
				plusButton: 'select2-selection__e-plus-button',
				// The select2Choice class name can not be changed to get the select2 choice style.
				select2Choice: 'select2-selection__choice',
			},
		};
	}

	isAllSelected() {
		let isAllSelected = false;

		this.select2.dataAdapter.query( {}, ( data ) => {
			const totalOptionsCount = data.results.length,
				currentSelectionsCount = this.elements.$element.select2( 'data' ).length;

			if ( currentSelectionsCount === totalOptionsCount ) {
				isAllSelected = true;
			}
		} );

		return isAllSelected;
	}

	addPlusButton() {
		const { plusButton, select2Choice } = this.getSettings( 'classes' ),
			plusButtonClasses = [ select2Choice, plusButton ].join( ' ' );

		this.elements.$plusButton = jQuery( '<li>', { class: plusButtonClasses } ).text( '+' );

		this.elements.$plusButton.insertBefore( this.elements.$inlineSearch );
	}

	togglePlusButton() {
		if ( this.isAllSelected() ) {
			if ( this.elements.$plusButton ) {
				this.elements.$plusButton.remove();
			}
		} else {
			this.addPlusButton();
		}
	}

	addSelect2Events() {
		this.select2.on( 'select', () => this.onSelectionChange() );

		this.select2.on( 'unselect', () => this.onSelectionChange() );
	}

	onSelectionChange() {
		this.togglePlusButton();
	}

	extendBaseFunctionality() {
		const config = this.select2.options.options;

		// When select2 has ajax the selected items re-render multiple times and deletes the injected plus-button.
		if ( config.multiple && ! config.ajax ) {
			this.togglePlusButton();

			this.addSelect2Events();
		}
	}

	initSelect2Elements() {
		const select2InlineSearch = this.getSettings( 'selectors.select2InlineSearch' );

		this.elements.$element = this.select2.$element;
		this.elements.$container = this.select2.$container;
		this.elements.$inlineSearch = this.elements.$container.find( select2InlineSearch );
	}

	destroy() {
		this.elements.$element.select2( 'destroy' );
	}

	onInit( ...args ) {
		super.onInit( ...args );

		const { $element, options } = this.getSettings();

		this.select2 = $element.select2( options ).data( 'select2' );

		this.initSelect2Elements();
		this.extendBaseFunctionality();
	}
}
