import { getVariantByMeta } from '@elementor/editor-styles';

import { useElement } from '../contexts/element-context';
import { useStyle } from '../contexts/style-context';
import { getCssPropertyValue, setCssPropertyValue } from '../utils/css-property-utils';
import { useStylesRerender } from './use-styles-rerender';

export function useCssClassField( bind: string ) {
	const { element: { id: elementId } } = useElement();
	const { id: styleId, meta, provider } = useStyle();

	useStylesRerender();

	const style = styleId ? ( provider?.actions.get( styleId, { elementId } ) ?? null ) : null;
	const variant = style ? getVariantByMeta( style, meta ) : null;
	const rawCss = ( variant && 'css' in variant ) ? variant.css : '';

	const value = getCssPropertyValue( rawCss, bind );

	const setValue = ( newValue: string ) => {
		if ( ! styleId || ! provider ) {
			return;
		}

		const newCss = setCssPropertyValue( rawCss, bind, newValue );

		provider.actions.updateCss?.( { id: styleId, meta, css: newCss }, { elementId } );
	};

	return { value, setValue };
}
