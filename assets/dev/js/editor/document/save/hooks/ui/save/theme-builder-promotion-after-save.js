import HookUIAfter from 'elementor-api/modules/hooks/ui/after';

function getPromotion() {
	const { scenario, introductionKey, assets } = elementor?.config?.document?.themeBuilderPromotion ?? {};

	if ( ! ( scenario && introductionKey && assets ) ) {
		return null;
	}

	return { scenario, introductionKey, assets };
}

export class ThemeBuilderPromotionAfterSave extends HookUIAfter {
	getCommand() {
		return 'document/save/save';
	}

	getId() {
		return 'theme-builder-promotion-after-save';
	}

	apply( args ) {
		const { status } = args;

		if ( 'publish' !== status ) {
			return;
		}

		const promotion = getPromotion();

		if ( ! promotion ) {
			return;
		}

		window.dispatchEvent(
			new CustomEvent( 'elementor/theme-builder-promotion/trigger', {
				detail: promotion,
			} ),
		);
	}
}

export default ThemeBuilderPromotionAfterSave;
