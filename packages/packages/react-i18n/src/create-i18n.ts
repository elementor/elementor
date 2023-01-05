import { createI18n as createOriginalI18n, I18n as OriginalI18n } from '@wordpress/i18n';
import { I18n, I18nSource } from './types';

export type CreateI18nOptions = {
    lang?: string;
    isRTL?: boolean;
    sources?: Record<string, I18nSource[]>
}

export default function createI18n( { lang = 'en_US', isRTL = false, sources = {} }: CreateI18nOptions = {} ): I18n {
	const i18n: OriginalI18n = createOriginalI18n();

	( sources?.[ lang ] || [] ).forEach( ( source: I18nSource ) => {
		if ( source.type === 'object' ) {
			i18n.setLocaleData( source.data, source.domain );
		}

		// TODO: Add support for URL sources.
	} );

	return {
		...i18n,
		isRTL: () => isRTL,
		getLang: () => lang,
	};
}
