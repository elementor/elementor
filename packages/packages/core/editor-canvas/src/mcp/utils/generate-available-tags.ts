import { getWidgetsCache, type V1ElementConfig } from '@elementor/editor-elements';

type ElTypedElementConfig = V1ElementConfig< {
	elType?: string;
} >;

export const generateAvailableTags = () => {
	const cache = getWidgetsCache< ElTypedElementConfig >();
	if ( ! cache ) {
		return [];
	}
	const customTags = Object.entries( cache )
		.filter( ( [ , widgetData ] ) => !! widgetData.atomic_controls )
		.map( ( [ widgetType, widgetData ] ) => {
			const configurationSchema = widgetData; //getElementSchemaAsJsonSchema( widgetType );
			return {
				tag: `${ widgetType }`,
				description: widgetData.title || widgetData.elType || `A ${ widgetType } element`,
				configurationSchema: JSON.stringify( configurationSchema ),
			};
		} );
	return customTags;
};
