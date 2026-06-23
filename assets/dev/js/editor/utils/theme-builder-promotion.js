export default class extends elementorModules.Module {
	constructor() {
		super();

		this.onTrigger = this.onTrigger.bind( this );

		window.addEventListener( 'elementor/theme-builder-promotion/trigger', this.onTrigger );
	}

	destroy() {
		window.removeEventListener( 'elementor/theme-builder-promotion/trigger', this.onTrigger );
	}

	onTrigger( event ) {
		if ( window.__ELEMENTOR_E2E__ ) {
			return;
		}

		const { scenario, introductionKey } = event?.detail ?? {};

		if ( ! ( scenario && introductionKey ) ) {
			return;
		}

		if ( this.isViewed( introductionKey ) ) {
			return;
		}

		document.dispatchEvent(
			new CustomEvent( 'theme-builder-promotion:open', {
				detail: {
					scenario,
					introductionKey,
				},
			} ),
		);
	}

	isViewed( introductionKey ) {
		return Boolean( elementor?.config?.user?.introduction?.[ introductionKey ] );
	}
}

