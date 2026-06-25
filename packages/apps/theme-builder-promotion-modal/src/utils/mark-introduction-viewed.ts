import type { ExtendedWindow } from '../types';

export async function markIntroductionViewed( introductionKey: string ): Promise< void > {
	const { elementor, elementorCommon } = window as ExtendedWindow;

	if ( ! elementor?.config?.user?.introduction ) {
		return;
	}

	elementor.config.user.introduction[ introductionKey ] = true;

	const promotionConfig = elementor.config.document?.themeBuilderPromotion;

	if ( promotionConfig?.introductionKey === introductionKey ) {
		delete elementor?.config?.document?.themeBuilderPromotion;
	}

	try {
		await elementorCommon?.ajax?.addRequest( 'introduction_viewed', {
			data: { introductionKey },
		} );
	} catch {}
}
