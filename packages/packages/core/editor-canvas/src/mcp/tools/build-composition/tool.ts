import { getCurrentDocument } from '@elementor/editor-documents';
import {
	createElement,
	type CreateElementParams,
	deleteElement,
	getContainer,
	getCurrentDocumentContainer,
	type V1Element,
} from '@elementor/editor-elements';
import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { undoable } from '@elementor/editor-v1-adapters';
import { type HttpResponse, httpService } from '@elementor/http-client';
import { z } from '@elementor/schema';
import { __ } from '@wordpress/i18n';

import { getMcpErrorMessage } from '../../utils/get-mcp-error-message';

const MCP_PROXY_URL = 'elementor/v1/mcp-proxy';
const TOOL_NAME = 'build-composition';
const DOCUMENT_ROOT = 'document';
const ELEMENTS_TO_JSON_OPTIONS = { remove: [ 'default', 'editSettings', 'defaultEditSettings' ] };

export const BUILD_COMPOSITION_GUIDE_URI = 'elementor://tools/build-composition-guide';

type PlannedElement = NonNullable< CreateElementParams[ 'model' ] >;

type BuildCompositionResponse = {
	root_element_ids: string[];
	removed_element_ids?: string[];
	resolved_xml?: string;
	warnings?: string[];
	warning_details?: unknown[];
	pro_features_discovery?: Array< { message: string; upgrade_url: string } >;
	elements: PlannedElement[];
};

type ElementsCollection = { toJSON: ( options: typeof ELEMENTS_TO_JSON_OPTIONS ) => unknown[] };

export const initBuildCompositionTool = ( reg: MCPRegistryEntry ) => {
	const { addTool, resource } = reg;

	resource(
		'build-composition-guide',
		BUILD_COMPOSITION_GUIDE_URI,
		{
			title: 'Build Composition Guide',
			description: 'Full guide for the build-composition tool',
			mimeType: 'text/markdown',
		},
		async ( uri: URL ) => {
			const { data } = await httpService().get< HttpResponse< string > >( MCP_PROXY_URL, {
				params: { uri: uri.href },
			} );

			return {
				contents: [ { uri: uri.href, mimeType: 'text/markdown', text: data.data } ],
			};
		}
	);

	addTool( {
		name: TOOL_NAME,
		description:
			'Build a V4 layout on the open page from an XML structure in one call. Read the build-composition guide resource before use. ' +
			'Every element in xml_structure needs a unique configuration-id; element_config, style, classes and interactions are keyed by it. ' +
			'The elements are added to the editor (unsaved, undoable) and their new element ids are returned in resolved_xml and root_element_ids.',
		schema: {
			xml_structure: z
				.string()
				.describe(
					'Raw XML of Elementor widget tags, e.g. <e-div-block configuration-id="hero"><e-heading configuration-id="hero-title"></e-heading></e-div-block>. No other attributes, ids, classes or text nodes.'
				),
			element_config: z
				.record( z.string(), z.any() )
				.optional()
				.describe( 'configuration-id → plain widget settings matching elementor://widgets/schema/{type}.' ),
			editor_settings: z
				.record( z.string(), z.any() )
				.optional()
				.describe( 'configuration-id → editor-only fields.' ),
			style: z
				.record( z.string(), z.string() )
				.optional()
				.describe(
					'configuration-id → plain CSS string. Supports &:hover/&:focus/&:active nesting and @media(--breakpoint) blocks.'
				),
			classes: z
				.record( z.string(), z.array( z.string() ) )
				.optional()
				.describe( 'configuration-id → existing global class labels to attach.' ),
			interactions: z
				.record( z.string(), z.array( z.record( z.string(), z.any() ) ) )
				.optional()
				.describe( 'configuration-id → interaction items. See elementor://interactions/schema.' ),
			parent_id: z
				.string()
				.optional()
				.describe( 'Element id of the parent container. Omit to insert at the document root.' ),
			mode: z
				.enum( [ 'append', 'replace_children' ] )
				.optional()
				.describe(
					'append (default) or replace_children, which removes the existing children of parent_id first.'
				),
		},
		outputSchema: {
			root_element_ids: z.array( z.string() ).describe( 'Ids of the created root-level elements.' ),
			resolved_xml: z.string().optional().describe( 'The XML with the new element ids embedded.' ),
			removed_element_ids: z.array( z.string() ).optional(),
			warnings: z.array( z.string() ).optional(),
			warning_details: z.array( z.any() ).optional(),
			pro_features_discovery: z.array( z.object( { message: z.string(), upgrade_url: z.string() } ) ).optional(),
		},
		requiredResources: [
			{ uri: BUILD_COMPOSITION_GUIDE_URI, description: 'Full guide for XML structure, ids, layouts and styles' },
		],
		handler: async ( { parent_id: parentId = DOCUMENT_ROOT, mode = 'append', ...input } ) => {
			const postId = getCurrentDocument()?.id;
			const documentContainer = getCurrentDocumentContainer();

			if ( ! postId || ! documentContainer ) {
				throw new Error( 'No active document found.' );
			}

			const parentContainer = parentId === DOCUMENT_ROOT ? documentContainer : getContainer( parentId );

			if ( ! parentContainer ) {
				throw new Error( `Parent element not found: ${ parentId }` );
			}

			let plan: BuildCompositionResponse;

			try {
				const { data } = await httpService().post< HttpResponse< BuildCompositionResponse > >( MCP_PROXY_URL, {
					tool: TOOL_NAME,
					input: {
						...input,
						post_id: postId,
						parent_id: parentId,
						mode,
						dry_run: true,
						document_elements: serializeElements( documentContainer ),
					},
				} );

				plan = data.data;
			} catch ( error ) {
				throw new Error( getMcpErrorMessage( error, TOOL_NAME ) );
			}

			applyPlan( parentContainer, plan );

			const { elements, ...result } = plan;

			return result;
		},
	} );
};

function serializeElements( container: V1Element ): unknown[] {
	const elements = container.model.get( 'elements' ) as ElementsCollection | undefined;

	return elements?.toJSON( ELEMENTS_TO_JSON_OPTIONS ) ?? [];
}

type RemovedElement = {
	model: PlannedElement;
	parentId: string;
	at: number;
};

type AppliedPlan = {
	removed: RemovedElement[];
	createdIds: string[];
};

function applyPlan(
	parentContainer: V1Element,
	{ elements, removed_element_ids: removedIds = [] }: BuildCompositionResponse
) {
	if ( ! Array.isArray( elements ) || ! elements.length ) {
		throw new Error( 'The planned composition has no elements to build' );
	}

	const apply = (): AppliedPlan => {
		const removed: RemovedElement[] = [];

		removedIds.forEach( ( id ) => {
			const container = getContainer( id );

			if ( ! container?.parent ) {
				return;
			}

			removed.push( {
				model: container.model.toJSON() as PlannedElement,
				parentId: container.parent.id,
				at: container.view?._index ?? 0,
			} );

			deleteElement( { container, options: { useHistory: false } } );
		} );

		const target = parentContainer.lookup?.() ?? parentContainer;
		const createdIds = elements.map(
			( model ) => createElement( { container: target, model, options: { useHistory: false } } ).id
		);

		return { removed, createdIds };
	};

	undoable(
		{
			do: apply,
			undo: ( _: undefined, { removed, createdIds }: AppliedPlan ) => {
				[ ...createdIds ].reverse().forEach( ( id ) => {
					const container = getContainer( id );

					if ( container ) {
						deleteElement( { container, options: { useHistory: false } } );
					}
				} );

				[ ...removed ].reverse().forEach( ( { model, parentId, at } ) => {
					const parent = getContainer( parentId );

					if ( parent ) {
						createElement( { container: parent, model, options: { useHistory: false, at } } );
					}
				} );
			},
			redo: apply,
		},
		{ title: __( 'Build composition', 'elementor' ) }
	)();
}
