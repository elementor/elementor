import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { z } from '@elementor/schema';

import { fetchCssClassUsage } from '../../service/css-class-usage-service';
import { type CssClassUsageContent, type EnhancedCssClassUsageContent } from '../components/css-class-usage/types';

export default function initMcpApplyGetGlobalClassUsages( reg: MCPRegistryEntry ) {
	const { addTool } = reg;
	const globalClassesUsageSchema = {
		usages: z.array(
			z.object( {
				classId: z
					.string()
					.describe(
						'The ID of the class, not visible to the user. To retreive the name of the class, use the "list-global-classes" tool'
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
		description: `Retreive the usage details of global classes within the Elementor editor, accross all pages.

## Prequisites:
- Use "list-global-classes" tool to be able to match class IDs to class names/labels.

## When to use this tool:
- When a user requests to see where a specific global class is being used accross the site.
- When you need to manage or clean up unused global classes.
- Before deleting a global class, to ensure it is not in use in any other pages.
`,
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
