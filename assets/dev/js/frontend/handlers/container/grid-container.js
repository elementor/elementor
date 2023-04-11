export default class GridContainer extends elementorModules.frontend.handlers.Base {
	isActive() {
		return elementorFrontend.isEditMode();
	}

	getDefaultSettings() {
		return {
			selectors: {
				emptyView: '.elementor-empty-view',
				gridContainer: '.e-con',
			},
			scssProperties: {
				gridTemplateRows: '--e-con-grid-template-rows',
			},
		};
	}

	getDefaultElements() {
		const selectors = this.getSettings( 'selectors' );

		return {
			emptyView: this.findElement( selectors.emptyView )[ 0 ],
			gridContainer: this.$element[ 0 ],
		};
	}

	onElementChange( propertyName ) {
		if ( 0 === propertyName.indexOf( 'grid_rows_grid' ) ) {
			this.updateEmptyViewHeight();
		}
	}

	updateEmptyViewHeight() {
		const { emptyView } = this.elements;

		emptyView.style?.removeProperty( 'min-height' );

		if ( ! this.doesControlHasSliderValue() ) {
			emptyView.style.minHeight = 'auto';
		}
	}

	doesControlHasSliderValue() {
		const { scssProperties: { gridTemplateRows } } = this.getDefaultSettings(),
			regexDefaultPattern = /^repeat\(\d+, 1fr\)$/,
			regexEmptyPattern = /^$/,
			regexDigitsPattern = /^\d+$/,
			gridTemplateRowsValue = window.getComputedStyle( this.elements.gridContainer ).getPropertyValue( gridTemplateRows ).trim();

		return regexDefaultPattern.test( gridTemplateRowsValue ) || regexEmptyPattern.test( gridTemplateRowsValue ) || regexDigitsPattern.test( gridTemplateRowsValue );
	}
}
