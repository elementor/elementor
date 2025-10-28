import { getWidgetsCache, type V1ElementConfig } from '@elementor/editor-elements';
import { zodToJsonSchema } from '@elementor/editor-mcp';
import { z } from '@elementor/schema';

import { getElementSchemaAsZod } from './get-element-configuration-schema';

type ElTypedElementConfig = V1ElementConfig< {
	elType?: string;
} >;

export const generateAvailableTags = (): { tag: string; description: string }[] => {
	const cache = getWidgetsCache< ElTypedElementConfig >();
	if ( ! cache ) {
		return [];
	}
	const customTags = Object.entries( cache )
		.filter( ( [ , widgetData ] ) => !! widgetData.atomic_controls )
		.map( ( [ widgetType, widgetData ] ) => {
			const configurationSchema = getElementSchemaAsZod( widgetType, true ).zodSchema;
			return {
				tag: `${ widgetType }`,
				description: widgetData.title || widgetData.elType || `A ${ widgetType } element`,
				configurationSchema: JSON.stringify( zodToJsonSchema( z.object( configurationSchema ) ) ),
			};
		} );
	return customTags;
};
