import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { type PropType, Schema } from '@elementor/editor-props';

import {
	type AtomicDynamicTag,
	getAtomicDynamicTags,
	OMITTED_DYNAMIC_SETTING_KEYS,
} from '../utils/resolve-dynamic-tag';

export const DYNAMIC_TAGS_URI = 'elementor://dynamic-tags';

const settingsSchema = ( propsSchema: AtomicDynamicTag[ 'props_schema' ] ): Record< string, unknown > => {
	return Object.fromEntries(
		Object.entries( propsSchema ?? {} )
			.filter( ( [ key ] ) => ! ( OMITTED_DYNAMIC_SETTING_KEYS as readonly string[] ).includes( key ) )
			.map( ( [ key, propType ] ) => [ key, Schema.propTypeToJsonSchema( propType as PropType ) ] )
	);
};

const buildDynamicTagsList = () => {
	return Object.values( getAtomicDynamicTags() ).map( ( tag ) => ( {
		name: tag.name,
		label: tag.label,
		categories: tag.categories,
		settings: settingsSchema( tag.props_schema ),
	} ) );
};

export const initDynamicTagsResource = ( reg: MCPRegistryEntry ) => {
	const { resource } = reg;

	resource(
		'dynamic-tags',
		DYNAMIC_TAGS_URI,
		{
			description:
				'List of available dynamic tags. To bind a property to a dynamic source, set its value to ' +
				'{ "$$type": "dynamic", "value": { "name": <tag name>, "settings": { ... } } } using a tag whose ' +
				'name appears in that property\'s allowed list, and populate "settings" per the tag entry here.',
			mimeType: 'application/json',
		},
		async ( uri: URL ) => ( {
			contents: [
				{
					uri: uri.href,
					mimeType: 'application/json',
					text: JSON.stringify( buildDynamicTagsList() ),
				},
			],
		} )
	);
};
