import type { ExtendedWindow } from '../types';

export async function markIntroductionViewed( introductionKey: string ): Promise< void > {
	const w = window as ExtendedWindow;

	if ( ! w.elementor?.config?.user?.introduction ) {
		return;
	}

	w.elementor.config.user.introduction[ introductionKey ] = true;

	const promotionConfig = w.elementor.config.document?.themeBuilderPromotion;

	if ( promotionConfig?.introductionKey === introductionKey ) {
		delete w.elementor?.config?.document?.themeBuilderPromotion;
	}

	try {
		await w.elementorCommon?.ajax?.addRequest( 'introduction_viewed', {
			data: { introductionKey },
		} );
	} catch {
		// Should never break the user flow.
	}
}
