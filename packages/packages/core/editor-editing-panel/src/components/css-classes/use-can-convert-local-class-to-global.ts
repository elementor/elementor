import { isElementsStylesProvider } from '@elementor/editor-styles-repository';

import { useElement } from '../../contexts/element-context';
import { useStyle } from '../../contexts/style-context';

export const useCanConvertLocalClassToGlobal = () => {
	const { element } = useElement();
	const { provider, id, meta } = useStyle();
	const styleDef = provider?.actions.get( id, { elementId: element.id, ...meta } );

	const isLocalStylesProvider = provider && isElementsStylesProvider( provider?.getKey() );
	const variants = styleDef?.variants || [];

	const canConvert = !! ( isLocalStylesProvider && variants.length );

	return {
		canConvert,
		isLocalStylesProvider,
		id,
		styleDef: styleDef || null,
	};
};
