import { type Props, type PropsSchema } from '@elementor/editor-props';

export function applySchemaDefaults( props: Props, schema: PropsSchema ): Props {
	const propsWithDefaults = { ...props };

	for ( const key of Object.keys( schema ) ) {
		const propDefault = schema[ key ]?.default;

		if ( propDefault == null ) {
			continue;
		}

		if ( propsWithDefaults[ key ] == null ) {
			propsWithDefaults[ key ] = propDefault;
		}
	}

	return propsWithDefaults;
}
