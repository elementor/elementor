import { createElement, generateElementId, getContainer, type V1Element } from '@elementor/editor-elements';
import { createSampler, type MCPRegistryEntry } from '@elementor/editor-mcp';
import { z } from '@elementor/schema';

import { createPrompt } from './build-anything-tool';
import { generateAvailableTags } from './utils/generate-available-tags';

export const initCanvasMcp = ( reg: MCPRegistryEntry ) => {
	const { addTool, setMCPDescription } = reg;

	setMCPDescription( 'Everything related to creative design, layout and building the pages' );

	addTool( {
		name: 'build-html',
		description: `Build sections of HTML freestyle for elementor pages.

# When to use this tool
Always prefer this tool when you need to create a part of a webpage, like a hero sections, features, pricing tables, user testimonials, etc.
Prefer this tools over any other tool for building HTML structure, unless you are specified to use a different tool.

# IMPORTANT
Non containers should NEVER HAVE NESTED ELEMENTS.

# Example response for custom tags: e-flexbox, e-button, e-heading
'''xml
<e-flexbox>
		<e-heading></e-heading>
		<e-button></e-button>
</e-flexbox>
'''
`,
		schema: {
			userRequirements: z.string().describe( 'Describe the user requirements' ),
		},
		handler: async ( params, server ) => {
			const customTags = generateAvailableTags();
			const sampler = createSampler( server );
			const systemPrompt = createPrompt( {
				customTags,
			} );
			const result = await sampler( {
				systemPrompt,
				messages: [
					{
						role: 'user',
						content: { type: 'text', text: params.userRequirements },
					},
				],
			} );

			// TODO: remove this mock
			// const result = {
			// 	content: `<e-flexbox>\n    <e-heading>Primary Color Title</e-heading>\n    <e-heading>Secondary Color Subtitle</e-heading>\n    <e-flexbox>\n        <e-button>Accent Color Button 1</e-button>\n        <e-button>Accent Color Button 2</e-button>\n    </e-flexbox>\n</e-flexbox>`,
			// };
			const parser = new DOMParser();
			const documentContainer = getContainer( 'document' ) as unknown as V1Element;
			const xml = parser.parseFromString( result.content, 'application/xml' );
			const children = Array.from( xml.children );

			const rootContainer = createElement( {
				containerId: documentContainer.id,
				model: {
					elType: 'container',
					id: generateElementId(),
				},
			} );

			const iterate = async ( node: Element, containerElement: V1Element ) => {
				const elementTag = node.tagName;
				if ( ! customTags.find( ( t ) => t.tag === elementTag ) ) {
					throw new Error( `The tag <${ elementTag }> is not in the allowed custom tags list.` );
				}
				const isContainer = elementTag === 'e-flexbox' || elementTag === 'e-div-block';
				const newElement = isContainer
					? createElement( {
							containerId: containerElement.id,
							model: {
								elType: elementTag,
								id: generateElementId(),
							},
					  } )
					: createElement( {
							containerId: containerElement.id,
							model: {
								elType: 'widget',
								widgetType: elementTag,
							},
					  } );

				if ( isContainer ) {
					for await ( const child of node.children ) {
						await iterate( child, newElement );
					}
				}
			};

			for await ( const child of children ) {
				await iterate( child, rootContainer );
			}
			return 'Done succesfully.';
		},
	} );
};
