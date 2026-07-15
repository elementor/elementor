import { getCurrentDocument, reloadCurrentDocument } from '@elementor/editor-documents';
import { getContainer, selectElement } from '@elementor/editor-elements';
import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { AxiosError, type HttpResponse, httpService } from '@elementor/http-client';
import { z } from '@elementor/schema';

const MCP_PROXY_URL = 'elementor/v1/mcp-proxy';

type BuildCompositionResponse = {
	success: boolean;
	post_id: number;
	root_element_ids: string[];
	preview_url: string;
	version: string;
	resolved_xml: string;
	llm_instructions: string;
	warnings?: string[];
};

export const initBuildCompositionTool = ( reg: MCPRegistryEntry ) => {
	const { addTool } = reg;

	addTool( {
		name: 'build-composition',
		description:
			'Build a V4 element composition on the Elementor canvas via the server-side MCP ability. ' +
			'Pass the raw XML tags directly as xmlStructure — do NOT wrap the value in <![CDATA[ ... ]]>, ' +
			'code fences, or quotes. The document is saved as a draft. Reload the editor after calling ' +
			'this tool to see the result.',
		schema: {
			xmlStructure: z
				.string()
				.describe(
					'Valid XML structure with custom Elementor widget tags. Every element MUST have a unique ' +
						'configuration-id attribute (e.g. <e-heading configuration-id="hero-title"></e-heading>). ' +
						'No attributes, classes, IDs, or text nodes in XML. Pass raw XML — do not wrap in CDATA.'
				),
			elementConfig: z
				.record(
					z.string().describe( 'configuration-id' ),
					z.record( z.string().describe( 'property name' ), z.any().describe( 'PropValue' ) )
				)
				.optional()
				.describe( 'Map configuration-id → widget PropValues ($$type + value).' ),
			style: z
				.record(
					z.string().describe( 'configuration-id' ),
					z.record(
						z.string().describe( 'CSS property name' ),
						z.string().describe( 'CSS value' )
					)
				)
				.optional()
				.describe(
					'Map configuration-id → raw CSS declarations (property → value strings; no selectors). ' +
						'Server converts to native styles; unconvertible declarations become the element custom CSS.'
				),
			parentId: z
				.string()
				.optional()
				.describe( "ID of the parent container. Omit or pass 'document' to insert at document root." ),
			dryRun: z
				.boolean()
				.optional()
				.describe( 'If true, validate and return the resolved tree without persisting.' ),
		},
		outputSchema: {
			rootElementIds: z.array( z.string() ),
			previewUrl: z.string(),
			version: z.string(),
			resolvedXml: z.string(),
			llmInstructions: z.string(),
			warnings: z.array( z.string() ).optional(),
		},
		handler: async ( { xmlStructure, elementConfig, style, parentId, dryRun } ) => {
			const document = getCurrentDocument();

			if ( ! document?.id ) {
				throw new Error( 'No active document found.' );
			}

			try {
				const { data } = await httpService().post< HttpResponse< BuildCompositionResponse > >(
					MCP_PROXY_URL,
					{
						tool: 'build-composition',
						input: {
							post_id: document.id,
							xml_structure: xmlStructure,
							element_config: elementConfig ?? {},
							style: style ?? {},
							parent_id: parentId ?? 'document',
							dry_run: dryRun ?? false,
						},
					}
				);

				if ( ! dryRun ) {
					await reloadCurrentDocument();

					const [ firstRootId ] = data.data.root_element_ids;
					if ( firstRootId ) {
						selectElement( firstRootId );
						getContainer( firstRootId )?.view?.el?.scrollIntoView( {
							behavior: 'smooth',
							block: 'center',
						} );
					}
				}

				return {
					rootElementIds: data.data.root_element_ids,
					previewUrl: data.data.preview_url,
					version: data.data.version,
					resolvedXml: data.data.resolved_xml,
					llmInstructions: data.data.llm_instructions,
					warnings: data.data.warnings,
				};
			} catch ( error ) {
				throw new Error( getErrorMessage( error ) );
			}
		},
	} );
};

function getErrorMessage( error: unknown ): string {
	if ( error instanceof AxiosError ) {
		const data = error.response?.data as { message?: string; code?: string } | undefined;
		if ( data?.message ) {
			return data.code ? `${ data.code }: ${ data.message }` : data.message;
		}
	}

	if ( error instanceof Error ) {
		return error.message;
	}

	return 'build-composition failed with an unknown error.';
}
