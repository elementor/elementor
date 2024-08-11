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

		const observer = this.createObserver();

		observer.observe( this.elements.$progressNumber[ 0 ] );
	}

	createObserver() {
		const options = {
			root: null,
			threshold: 0,
			rootMargin: '0px',
		};

		return new IntersectionObserver( ( entries ) => {
			entries.forEach( ( entry ) => {
				if ( entry.isIntersecting ) {
					const $progressbar = this.elements.$progressNumber;

					$progressbar.css( 'width', $progressbar.data( 'max' ) + '%' );
				}
			} );
		}, options );
	}
}
