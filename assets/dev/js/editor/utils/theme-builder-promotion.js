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
		const scenario = event?.detail?.scenario;
		const introductionKey = event?.detail?.introductionKey;

		if ( ! scenario ) {
			return;
		}

		if ( ! introductionKey ) {
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

