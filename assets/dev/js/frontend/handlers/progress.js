export default class Progress extends elementorModules.frontend.handlers.Base {
	getDefaultSettings() {
		return {
			selectors: {
				progressNumber: '.elementor-progress-bar',
			},
		};
	}

	getDefaultElements() {
		const selectors = this.getSettings( 'selectors' );
		return {
			$progressNumber: this.$element.find( selectors.progressNumber ),
		};
	}

	onInit() {
		super.onInit();

		elementorFrontend.waypoint( this.elements.$progressNumber, () => {
			const $progressbar = this.elements.$progressNumber;

			$progressbar.css( 'width', $progressbar.data( 'max' ) + '%' );
		} );
	}
}
