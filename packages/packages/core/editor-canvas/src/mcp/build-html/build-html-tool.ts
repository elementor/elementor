import {
	createElement,
	deleteElement,
	generateElementId,
	getContainer,
	type V1Element,
} from '@elementor/editor-elements';
import { createSampler, type MCPRegistryEntry } from '@elementor/editor-mcp';
import { type PropValue } from '@elementor/editor-props';
import { z } from '@elementor/schema';

import { doUpdateElementProperty } from '../utils/do-update-element-property';
import { generateAvailableTags } from '../utils/generate-available-tags';
import { createPrompt, toolDescription } from './build-html-tool-prompt';

export const initBuildHtmlTool = ( reg: MCPRegistryEntry ) => {
	const { addTool } = reg;

	addTool( {
		name: 'build-html',
		description: toolDescription,
		schema: {
			userRequirements: z.string().describe( 'Describe the user requirements' ),
			llmInstructions: z
				.string()
				.optional()
				.describe( 'Additional instructions for the LLM to consider when building the HTML structure' ),
		},
		outputSchema: {
			xml: z.string().describe( 'The finalized XML structure, with unique ID attributes' ),
			llmInstructions: z.string().optional().describe( 'Instructions for the next steps' ),
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
			const documentContainer = getContainer( 'document' ) as unknown as V1Element;
			const rootContainer = createElement( {
				containerId: documentContainer.id,
				model: {
					elType: 'container',
					id: generateElementId(),
				},
			} );

			const errors: Error[] = [];

			const parser = new DOMParser();
			const xml = parser.parseFromString( result.content, 'application/xml' );
			const errorNode = xml.querySelector( 'parsererror' );
			if ( errorNode ) {
				throw new Error( `Failed to parse XML: ${ errorNode.textContent }` );
			}
			const children = Array.from( xml.children );

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

				node.setAttribute( 'id', newElement.id );
				if ( node.getAttribute( 'configuration' ) ) {
					const configString = node.getAttribute( 'configuration' ) || '{}';
					try {
						const object = JSON.parse( configString );
						for await ( const [ propName, propValue ] of Object.entries( object ) ) {
							doUpdateElementProperty( {
								elementId: newElement.id,
								propertyName: propName,
								propertyValue: propValue as PropValue,
								elementType: elementTag,
							} );
						}
					} catch ( error ) {
						errors.push(
							new Error( `Failed to parse configuration for element <${ elementTag }>: ${ error }` )
						);
					}
				}
				if ( isContainer ) {
					for await ( const child of node.children ) {
						await iterate( child, newElement );
					}
				} else {
					node.innerHTML = '';
				}
			};

			for await ( const child of children ) {
				await iterate( child, rootContainer );
			}

			if ( errors.length > 0 ) {
				deleteElement( {
					elementId: rootContainer.id,
					options: { useHistory: false },
				} );
				throw new Error( errors.map( ( e ) => e.message ).join( '\n' ) );
			}

			return {
				xml: new XMLSerializer().serializeToString( xml ),
			};
		},
	} );
};
