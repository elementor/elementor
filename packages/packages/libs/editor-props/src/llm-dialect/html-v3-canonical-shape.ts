import { type PropValue, type TransformablePropValue } from '../types';
import { isHtmlV3PropValue } from './html-v3-dynamic-fallback';

export const canonicalizeHtmlV3PropValue = ( propValue: PropValue ): PropValue => {
	if ( ! isHtmlV3PropValue( propValue ) ) {
		return propValue;
	}

	const { content, children } = propValue.value;

	return {
		$$type: 'html-v3',
		value: {
			content,
			children: children ?? [],
		},
	} as TransformablePropValue< 'html-v3', { content: PropValue; children: PropValue[] } >;
};
