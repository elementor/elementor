import { ThemeBuilderPromotionAfterSave } from '../document/save/hooks/ui/save/theme-builder-promotion-after-save';

export default class extends elementorModules.editor.utils.Module {
	onElementorInit() {
		this.onTrigger = this.onTrigger.bind( this );

		window.addEventListener( 'elementor/theme-builder-promotion/trigger', this.onTrigger );
	}

	onElementorInitComponents() {
		if ( ! this.shouldRegisterSaveHook() ) {
			return;
		}

		$e.components.get( 'document/save' ).registerHook( new ThemeBuilderPromotionAfterSave() );
	}

	destroy() {
		window.removeEventListener( 'elementor/theme-builder-promotion/trigger', this.onTrigger );
	}

	onTrigger( event ) {
		const { scenario, introductionKey } = event?.detail ?? {};

		if ( ! ( scenario && introductionKey ) ) {
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

	shouldRegisterSaveHook() {
		const config = elementor?.config?.initial_document?.themeBuilderPromotion ??
			elementor?.config?.document?.themeBuilderPromotion ??
			null;

		return config?.scenario && config?.introductionKey;
	}
}
