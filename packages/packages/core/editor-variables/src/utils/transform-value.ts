import { styleTransformersRegistry } from '@elementor/editor-canvas';
import { type PropValue } from '@elementor/editor-props';

export function transformValue( propValue: PropValue ) {
	if ( propValue && typeof propValue === 'object' && '$$type' in propValue ) {
		const transformer = styleTransformersRegistry.get( propValue.$$type );

		if ( ! transformer ) {
			return '';
		}

		return transformer( propValue.value, { key: propValue.$$type } ) as string;
	}

	return '';
}
