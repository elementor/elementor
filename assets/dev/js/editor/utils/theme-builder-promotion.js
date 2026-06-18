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

		const mode = this.isViewed( introductionKey ) ? 'alert' : 'modal';

		document.dispatchEvent(
			new CustomEvent( 'theme-builder-promotion:open', {
				detail: {
					scenario,
					introductionKey,
					mode,
				},
			} ),
		);
	}

	getIntroductionKey( scenario ) {
		if ( 'single_post' === scenario ) {
			return 'introduce_theme_builder_single_post_popup';
		}

		if ( 'single_product' === scenario ) {
			return 'introduce_theme_builder_single_product_popup';
		}

		if ( 'header_footer' === scenario ) {
			return 'introduce_theme_builder_header_footer_popup';
		}

		return null;
	}

	isViewed( introductionKey ) {
		return Boolean( elementor?.config?.user?.introduction?.[ introductionKey ] );
	}
}

