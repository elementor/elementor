import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { z } from '@elementor/schema';

import { fetchCssClassUsage } from '../../service/css-class-usage-service';
import { type CssClassUsageContent, type EnhancedCssClassUsageContent } from '../components/css-class-usage/types';
import { GLOBAL_CLASSES_URI } from './classes-resource';

export default function initMcpApplyGetGlobalClassUsages( reg: MCPRegistryEntry ) {
	const { addTool } = reg;
	const globalClassesUsageSchema = {
		usages: z.array(
			z.object( {
				classId: z
					.string()
					.describe(
						'The ID of the class, not visible to the user. To retrieve the name of the class, use the "list-global-classes" tool'
					),
				usages: z.array(
					z.object( {
						pageId: z.string().describe( 'The ID of the page where the class is used' ),
						title: z.string().describe( 'The title of the page where the class is used' ),
						total: z.number().describe( 'The number of times the class is used on this page' ),
						elements: z.array( z.string() ).describe( 'List of element IDs using this class on the page' ),
					} )
				),
			} )
		),
	};

	addTool( {
		name: 'get-global-class-usages',
		modelPreferences: {
			intelligencePriority: 0.6,
			speedPriority: 0.8,
		},
		description: `Retrieve usages of global classes across all Elementor pages. Heavy operation — scans every page in the site.

## When to use:
- Before deleting or radically changing a class — to understand cross-page side effects and decide whether to consult the user.
- To identify unused global classes for cleanup.

## When NOT to use:
- To list global classes themselves — use the global-classes resource instead (this tool returns usages, not the class list).`,
		requiredResources: [ { description: 'Global classes list', uri: GLOBAL_CLASSES_URI } ],
		outputSchema: globalClassesUsageSchema,
		handler: async () => {
			const data = await fetchCssClassUsage();
			const result = {
				usages: [] as z.infer< ( typeof globalClassesUsageSchema )[ 'usages' ] >,
			};

			Object.entries( data as unknown as EnhancedCssClassUsageContent ).forEach(
				( [ classId, usageDetails ] ) => {
					const newEntry: ( typeof result )[ 'usages' ][ 0 ] = {
						classId,
						usages: [],
					};
					if ( typeof usageDetails !== 'number' ) {
						const { content } = usageDetails as unknown as { content: CssClassUsageContent[] };
						content.forEach( ( detail ) => {
							newEntry.usages.push( {
								pageId: String( detail.pageId ),
								title: detail.title,
								total: detail.total,
								elements: detail.elements,
							} );
						} );
						result.usages.push( newEntry );
					}
				}
			);

			return result;
		},
	} );
}
