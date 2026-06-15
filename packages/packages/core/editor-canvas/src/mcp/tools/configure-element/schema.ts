import { z } from '@elementor/schema';

import { WIDGET_SCHEMA_URI } from '../../resources/widgets-schema-resource';

export const inputSchema = {
	propertiesToChange: z
		.record(
			z.string().describe( 'The property name.' ),
			z
				.any()
				.describe( `PropValue, refer to [${ WIDGET_SCHEMA_URI }] by correct type, as appears in elementType` ),
			z.any()
		)
		.describe( 'An object record containing property names and their new values to be set on the element' ),
	style: z
		.record(
			z.string().describe( 'A CSS property name, e.g. "color", "margin-top".' ),
			z
				.string()
				.nullable()
				.describe(
					'A CSS value, e.g. "red", "10px", "1px solid #000". Use null to reset the property to its default.'
				)
		)
		.describe(
			'Raw CSS declarations as a flat property→value map. Converted to native styles server-side; any declaration that cannot be converted is stored as the element custom CSS. A null value resets that property to its default.'
		)
		.default( {} ),
	elementType: z.string().describe( 'The type of the element to retrieve the schema' ),
	elementId: z.string().describe( 'The unique id of the element to configure' ),
};

export const outputSchema = {
	success: z
		.boolean()
		.describe(
			'Whether the configuration change was successful, only if propertyName and propertyValue are provided'
		),
};
