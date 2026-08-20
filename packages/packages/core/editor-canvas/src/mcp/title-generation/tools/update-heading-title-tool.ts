import { getContainer } from '@elementor/editor-elements';
import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { htmlV3PropTypeUtil, stringPropTypeUtil } from '@elementor/editor-props';
import { z } from '@elementor/schema';

import { doUpdateElementProperty } from '../../utils/do-update-element-property';

const HEADING_ELEMENT_TYPE = 'e-heading';

const schema = {
	elementId: z.string().describe( 'The ID of the e-heading element to update' ),
	title: z.string().describe( 'The generated heading title text to apply' ),
};

export const initUpdateHeadingTitleTool = ( reg: MCPRegistryEntry ) => {
	const { addTool } = reg;

	addTool( {
		name: 'update-heading-title',
		description:
			'Generate and write the title for a V4 atomic heading (e-heading). Pass the element ID and the final plain-text title.',
		schema,
		isDestructive: true,
		outputSchema: {
			success: z.boolean().describe( 'Whether the title was updated successfully' ),
			elementId: z.string().describe( 'The updated element ID' ),
			title: z.string().describe( 'The title that was written' ),
		},
		handler: ( { elementId, title } ) => {
			const container = getContainer( elementId );

			if ( ! container ) {
				throw new Error( `Element with id ${ elementId } not found` );
			}

			const elementType =
				container.settings.get( 'widgetType' ) || ( container as Record< string, unknown > ).type;

			if ( elementType !== HEADING_ELEMENT_TYPE ) {
				throw new Error(
					`Element with ID ${ elementId } is not an e-heading element (found: ${ String( elementType ) })`
				);
			}

			const propertyValue = htmlV3PropTypeUtil.create( {
				content: stringPropTypeUtil.create( title ),
				children: [],
			} );

			doUpdateElementProperty( {
				elementId,
				elementType: HEADING_ELEMENT_TYPE,
				propertyName: 'title',
				propertyValue,
			} );

			return {
				success: true,
				elementId,
				title,
			};
		},
	} );
};
