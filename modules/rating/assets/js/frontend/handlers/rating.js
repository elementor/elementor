
export default class RatingHandler extends elementorModules.frontend.handlers.Base {
	getDefaultSettings() {
		return {
			selectors: {
				icons: '.elementor-rating__wrapper i',
			},
		};
	}

	getDefaultElements() {
		const { selectors } = this.getSettings();
		const element = this.$element[ 0 ];

		return {
			icons: element.querySelectorAll( selectors.icons ),
		};
	}

	onInit() {
		console.log( 'RatingHandler.onInit()' );
		this.elements = this.getDefaultElements();
		[ ...this.elements.icons ].forEach( ( icon, index ) => {
			const iconContent = window.getComputedStyle( icon, ':before' ).getPropertyValue( 'content' );
			const iconContentValue = iconContent.replace( /['"]+/g, '' );
			icon.setAttribute( 'data-content', iconContentValue );
		} );
	}
}
