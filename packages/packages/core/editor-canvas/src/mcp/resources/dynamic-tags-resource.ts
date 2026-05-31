import { type MCPRegistryEntry, ResourceTemplate } from '@elementor/editor-mcp';
import { getElementorConfig, v1ReadyEvent } from '@elementor/editor-v1-adapters';

import {
	buildDynamicTagsByCategoryPayload,
	buildDynamicTagsResourcePayload,
	listDynamicTagCategories,
} from './build-dynamic-tags-resource-payload';
import { CANVAS_SERVER_NAME } from './widgets-schema-resource';

export const DYNAMIC_TAGS_URI = 'elementor://dynamic-tags';
export const DYNAMIC_TAGS_BY_CATEGORY_URI = 'elementor://dynamic-tags/{category}';
export const DYNAMIC_TAGS_FULL_URI = `${ CANVAS_SERVER_NAME }_${ DYNAMIC_TAGS_URI }`;

const getAtomicDynamicTags = () => getElementorConfig().atomicDynamicTags;

export const initDynamicTagsResource = ( reg: MCPRegistryEntry ) => {
	const { resource, sendResourceUpdated } = reg;

	const buildCatalogResponse = () => ( {
		contents: [
			{
				uri: DYNAMIC_TAGS_URI,
				mimeType: 'application/json',
				text: JSON.stringify( buildDynamicTagsResourcePayload( getAtomicDynamicTags() ) ),
			},
		],
	} );

	resource(
		'dynamic-tags',
		DYNAMIC_TAGS_URI,
		{
			description:
				'Dynamic tags catalog for bindTo on LLM dialect props. Use tag name as bindTo value. See by_category for tags per category.',
		},
		() => buildCatalogResponse()
	);

	resource(
		'dynamic-tags-by-category',
		new ResourceTemplate( DYNAMIC_TAGS_BY_CATEGORY_URI, {
			list: () => ( {
				resources: listDynamicTagCategories( getAtomicDynamicTags() ).map( ( category ) => ( {
					uri: `elementor://dynamic-tags/${ category }`,
					name: `Dynamic tags for category ${ category }`,
				} ) ),
			} ),
		} ),
		{
			description: 'Dynamic tags allowed for a specific category (text, url, color, etc.)',
		},
		async ( uri, variables ) => {
			const category = typeof variables.category === 'string' ? variables.category : variables.category?.[ 0 ];
			if ( ! category ) {
				throw new Error( 'Missing dynamic tag category' );
			}

			const payload = buildDynamicTagsByCategoryPayload( getAtomicDynamicTags(), category );
			if ( payload.tag_names.length === 0 ) {
				throw new Error( `No dynamic tags found for category: ${ category }` );
			}

			return {
				contents: [
					{
						uri: uri.toString(),
						mimeType: 'application/json',
						text: JSON.stringify( payload ),
					},
				],
			};
		}
	);

	window.addEventListener( v1ReadyEvent().name, () => {
		sendResourceUpdated( {
			uri: DYNAMIC_TAGS_URI,
			...buildCatalogResponse(),
		} );
	} );
};
