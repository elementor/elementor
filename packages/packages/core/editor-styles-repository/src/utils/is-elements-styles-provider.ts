import { ELEMENTS_STYLES_PROVIDER_KEY_PREFIX } from '../providers/document-elements-styles-provider';

export function isElementsStylesProvider( key: string ) {
	return new RegExp( `^${ ELEMENTS_STYLES_PROVIDER_KEY_PREFIX }\\d+$` ).test( key );
}
