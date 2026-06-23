import type { ExtendedWindow } from '../types';

export async function markIntroductionViewed( introductionKey: string ): Promise< void > {
	const w = window as ExtendedWindow;

	if ( ! w.elementor?.config?.user?.introduction ) {
		return;
	}

	w.elementor.config.user.introduction[ introductionKey ] = true;

	try {
		await w.elementorCommon?.ajax?.addRequest( 'introduction_viewed', {
			data: { introductionKey },
		} );
	} catch {
		// Analytics gating should never break the user flow.
	}
}
