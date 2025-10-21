import { type JsonSchema7Type } from 'zod-to-json-schema';
import { getWidgetsCache } from '@elementor/editor-elements';
import { zodToJsonSchema } from '@elementor/editor-mcp';
import { z } from '@elementor/schema';

import { getElementSchemaAsZod } from './get-element-configuration-schema';

export const getAllElementsConfiguration = (): Record< string, JsonSchema7Type > => {
	const widgetsCache = getWidgetsCache();

	if ( ! widgetsCache ) {
		return {};
	}

	const configurations: Record< string, JsonSchema7Type > = {};
	for ( const elementType of Object.keys( widgetsCache ) ) {
		if ( ! widgetsCache[ elementType ]?.atomic_props_schema ) {
			continue;
		}
		const schema = getElementSchemaAsZod( elementType );
		configurations[ elementType ] = zodToJsonSchema( z.object( schema.zodSchema ).optional() );
	}

	return configurations;
};
