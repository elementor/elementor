import {
	createElement,
	deleteElement,
	generateElementId,
	getContainer,
	type V1Element,
} from '@elementor/editor-elements';
import { createSampler, type MCPRegistryEntry, Zod as z4 } from '@elementor/editor-mcp';
import { type PropValue } from '@elementor/editor-props';
import { z } from '@elementor/schema';

import { doUpdateElementProperty } from '../utils/do-update-element-property';
import { generateAvailableTags } from '../utils/generate-available-tags';
import { buildStyleSchema } from '../utils/get-element-configuration-schema';
import { createPrompt, toolDescription } from './build-html-tool-prompt';

export const initBuildHtmlTool = ( reg: MCPRegistryEntry ) => {
	const { addTool } = reg;

	addTool( {
		name: 'build-html',
		description: toolDescription,
		outputSchema: {
			result: z.string().describe( 'The generated XML structure as a string' ),
			llmInstructions: z.string().describe( 'The instructions given to the LLM to generate the XML' ),
		},
		schema: {
			userRequirements: z.string().describe( 'Describe the user requirements' ),
		},
		handler: async ( params, server ) => {
			const errors: Error[] = [];
			let rootContainerId = '';
			try {
				const customTags = generateAvailableTags();
				const stylesSchema = JSON.stringify( z4.toJSONSchema( z4.object( buildStyleSchema() ) ) );
				const sampler = createSampler( server );
				const systemPrompt = createPrompt( {
					customTags,
					stylesSchema,
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
					options: { useHistory: false },
				} );
				rootContainerId = rootContainer.id;
				let xml: Document;

				try {
					const parser = new DOMParser();
					xml = parser.parseFromString( result.content, 'application/xml' );
					const errorNode = xml.querySelector( 'parsererror' );
					if ( errorNode ) {
						throw new Error( `Failed to parse XML: ${ errorNode.textContent }` );
					}
				} catch ( error ) {
					errors.push( new Error( `Failed to parse XML: ${ ( error as Error ).message }` ) );
					throw new Error( errors.map( ( e ) => e.message ).join( '\n' ) );
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
								options: { useHistory: false },
						  } )
						: createElement( {
								containerId: containerElement.id,
								model: {
									elType: 'widget',
									widgetType: elementTag,
								},
								options: { useHistory: false },
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
							try {
								await iterate( child, newElement );
							} catch ( error ) {
								errors.push( error as Error );
							}
						}
					} else {
						node.innerHTML = '';
					}
				};

				for await ( const child of children ) {
					try {
						await iterate( child, rootContainer );
					} catch ( error ) {
						errors.push( error as Error );
					}
				}

				const serializedXML = new XMLSerializer().serializeToString( xml );
				if ( serializedXML.trim() === '' ) {
					errors.push( new Error( 'The generated XML is empty or could not be parsed. Try again' ) );
				}

				if ( errors.length > 0 && rootContainer.children?.length === 0 ) {
					deleteElement( {
						elementId: rootContainer.id,
						options: { useHistory: false },
					} );
					throw new Error( errors.map( ( e ) => e.message ).join( '\n' ) );
				}

				return {
					result: serializedXML,
					llmInstructions: `Next steps:
The structure is built and you have the generated element Id's, it's the best time to apply global classes.
Use the "list-global-classes" tool to get the available global styles. Go over the list and see if any name of a class suggests it fits any element in the structure you built.
Use the "apply-globtoal-class" tool  apply the global styles to the elements in the structure you built, if you think it is required.`,
				};
			} catch ( error ) {
				deleteElement( {
					elementId: rootContainerId,
					options: { useHistory: false },
				} );
				throw error;
			}
		},
	} );
};
