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

		if ( ! scenario ) {
			return;
		}

		const introductionKey = this.getIntroductionKey( scenario );

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

	getIntroductionKey( scenario ) {
		if ( ! scenario ) {
			return null;
		}

		return `introduce_theme_builder_${ scenario }_popup`;
	}

	isViewed( introductionKey ) {
		return Boolean( elementor?.config?.user?.introduction?.[ introductionKey ] );
	}
}

