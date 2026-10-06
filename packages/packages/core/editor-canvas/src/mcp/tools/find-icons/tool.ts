import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { type HttpResponse, httpService } from '@elementor/http-client';
import { z } from '@elementor/schema';

import { getMcpErrorMessage } from '../../utils/get-mcp-error-message';
import { findIconsToolPrompt } from './prompt';

const MCP_PROXY_URL = 'elementor/v1/mcp-proxy';

const MAX_QUERIES = 10;

const MAX_PER_PAGE = 25;

type IconMatch = {
	value: string;
	library: string;
	name: string;
	label: string;
	matched_on: string;
	license: string;
};

type IconQueryResult = {
	query: string;
	matches: IconMatch[];
	total: number;
	page: number;
	per_page: number;
	truncated: boolean;
};

// NOTE: shape defined by Find_Icons_Ability::execute() in modules/mcp/abilities/find-icons-ability.php
type FindIconsResponse = {
	results: IconQueryResult[];
	libraries: string[];
	categories: string[];
	font_awesome_version: string | null;
	llm_instructions?: string;
};

export const initFindIconsTool = ( reg: MCPRegistryEntry ) => {
	const { addTool } = reg;

	addTool( {
		name: 'find-icons',
		description: findIconsToolPrompt.prompt(),
		schema: {
			queries: z
				.array( z.string() )
				.max( MAX_QUERIES )
				.optional()
				.describe(
					'One plain-language phrase per icon you need, for example ["add to cart", "free shipping"]. Batch every icon a page needs into a single call.'
				),
			library: z
				.string()
				.optional()
				.describe(
					'Restrict results to one library key reported in "libraries", for example "fa-solid". Omit to search every library installed on the site.'
				),
			category: z
				.string()
				.optional()
				.describe(
					'Restrict results to one Font Awesome category reported in "categories", for example "shopping". May be used without a query to browse that category.'
				),
			page: z.number().min( 1 ).optional(),
			perPage: z.number().min( 1 ).max( MAX_PER_PAGE ).optional(),
		},
		outputSchema: {
			results: z
				.array( z.any() )
				.describe(
					'One entry per query, each with ranked "matches". Every match carries the "value" and "library" pair to write on the e-svg icon prop, plus "matched_on" and "license".'
				),
			libraries: z.array( z.string() ).describe( 'Icon library keys installed on this site.' ),
			categories: z.array( z.string() ).describe( 'Icon categories available for the "category" filter.' ),
			fontAwesomeVersion: z.string().nullable().describe( 'Font Awesome version the site renders icons from.' ),
			llmInstructions: z
				.string()
				.optional()
				.describe( 'Present only when nothing matched, explaining what to do next.' ),
		},
		handler: async ( { queries, library, category, page, perPage } ) => {
			try {
				const { data } = await httpService().post< HttpResponse< FindIconsResponse > >( MCP_PROXY_URL, {
					tool: 'find-icons',
					input: {
						...( queries ? { queries } : {} ),
						...( library ? { library } : {} ),
						...( category ? { category } : {} ),
						...( page ? { page } : {} ),
						...( perPage ? { per_page: perPage } : {} ),
					},
				} );

				return {
					results: data.data.results,
					libraries: data.data.libraries,
					categories: data.data.categories,
					fontAwesomeVersion: data.data.font_awesome_version,
					...( data.data.llm_instructions ? { llmInstructions: data.data.llm_instructions } : {} ),
				};
			} catch ( error ) {
				throw new Error( getMcpErrorMessage( error, 'find-icons' ) );
			}
		},
	} );
};
