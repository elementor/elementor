import { createI18n as createOriginalI18n, I18n as OriginalI18n } from '@wordpress/i18n';
import { I18n, I18nSource } from './types';

const RTL_LANGUAGES = [
	'ae',	/* Avestan */
	'ar', /* 'العربية', Arabic */
	'arc', /* Aramaic */
	'bcc', /* 'بلوچی مکرانی', Southern Balochi */
	'bqi', /* 'بختياري', Bakthiari */
	'ckb', /* 'Soranî / کوردی', Sorani */
	'dv', /* Dhivehi */
	'fa', /* 'فارسی', Persian */
	'glk', /* 'گیلکی', Gilaki */
	'he', /* 'עברית', Hebrew */
	'ku', /* 'Kurdî / كوردی', Kurdish */
	'mzn', /* 'مازِرونی', Mazanderani */
	'nqo', /* N'Ko */
	'pnb', /* 'پنجابی', Western Punjabi */
	'ps', /* 'پښتو', Pashto */
	'sd', /* 'سنڌي', Sindhi */
	'ug', /* 'Uyghurche / ئۇيغۇرچە', Uyghur */
	'ur', /* 'اردو', Urdu */
	'yi', /* 'ייִדיש', Yiddish */
];

function loadSources( i18n: OriginalI18n, sources: I18nSource[] ) {
	sources.forEach( ( source: I18nSource ) => {
		if ( source.type !== 'jed-object' ) {
			// TODO: Add support for URL sources.
			return;
		}

		i18n.setLocaleData( source.data, source.domain );
	} );
}

function isRTL( locale: string ): boolean {
	const lang = locale.split( /[-_]/ )[ 0 ];

	return RTL_LANGUAGES.includes( lang );
}

export type CreateI18nSettings = {
	locale?: string;
	sources?: Record<string, I18nSource[]>;
}

export default function createI18n( { locale = 'en_US', sources = {} }: CreateI18nSettings = {} ): I18n {
	const i18n: OriginalI18n = createOriginalI18n();

	loadSources( i18n, sources[ locale ] || [] );

	return {
		__: i18n.__,
		_n: i18n._n,
		_x: i18n._x,
		_nx: i18n._nx,
		isRTL: () => isRTL( locale ),
		getLocale: () => locale,
	};
}
