import HookUIAfter from 'elementor-api/modules/hooks/ui/after';

function getCandidate( result ) {
	// Check for weird save contexts with different object structures.
	const candidate = result?.data?.config?.document?.themeBuilderPromotion ??
		result?.data?.config?.themeBuilderPromotion ??
		result?.data?.themeBuilderPromotion ??
		elementor?.config?.document?.themeBuilderPromotion ??
		null;

	return 'object' === typeof candidate ? candidate : null;
}

function getPromotion( result ) {
	const candidate = getCandidate( result );

	const { shouldShow, scenario, introductionKey } = candidate ?? {};

	if ( ! ( shouldShow && scenario && introductionKey ) ) {
		return null;
	}

	return { scenario, introductionKey };
}

export class ThemeBuilderPromotionAfterSave extends HookUIAfter {
	getCommand() {
		return 'document/save/save';
	}

	getId() {
		return 'theme-builder-promotion-after-save';
	}

	apply( args, result ) {
		const { status } = args;

		if ( 'publish' !== status ) {
			return;
		}

		const promotion = getPromotion( result );

		if ( ! promotion ) {
			return;
		}

		window.dispatchEvent(
			new CustomEvent( 'elementor/theme-builder-promotion/trigger', {
				detail: {
					scenario: promotion.scenario,
					introductionKey: promotion.introductionKey,
				},
			} ),
		);
	}
}

export default ThemeBuilderPromotionAfterSave;

