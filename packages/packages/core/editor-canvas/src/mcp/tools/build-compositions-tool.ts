import {
	createElement,
	deleteElement,
	generateElementId,
	getContainer,
	getWidgetsCache,
	type V1Element,
} from '@elementor/editor-elements';
import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { type PropValue } from '@elementor/editor-props';
import { z } from '@elementor/schema';

import { doUpdateElementProperty } from '../utils/do-update-element-property';
import { generatePrompt } from './build-compositions-tool-prompt';

export const initBuildCompositionsTool = ( reg: MCPRegistryEntry ) => {
	const { addTool } = reg;

	addTool( {
		name: 'build-compositions',
		description: generatePrompt(),
		schema: {
			xmlStructure: z.string().describe( 'The XML structure representing the composition to be built' ),
			elementConfig: z
				.record(
					z.string().describe( 'The configuration id' ),
					z.record(
						z.string().describe( 'property name' ),
						z.any().describe( 'The PropValue for the property' )
					)
				)
				.describe( 'A record mapping element IDs to their configuration objects' ),
			stylesConfig: z
				.record(
					z.string().describe( 'The configuration id' ),
					z.record(
						z.string().describe( '_styles property name' ),
						z.any().describe( 'The PropValue for the style property' )
					)
				)
				.optional()
				.default( {} ),
		},
		outputSchema: {
			errors: z.string().describe( 'Error message if the composition building failed' ).optional(),
			xmlStructure: z.string().describe( 'The built XML structure as a string' ).optional(),
		},
		handler: async ( params ) => {
			let xml: Document | null = null;
			const { xmlStructure, elementConfig, stylesConfig } = params;
			const errors: Error[] = [];
			const widgetsCache = getWidgetsCache() || {};
			const documentContainer = getContainer( 'document' ) as unknown as V1Element;
			const rootContainer = createElement( {
				containerId: documentContainer.id,
				model: {
					elType: 'container',
					id: generateElementId(),
				},
				options: { useHistory: false },
			} );
			try {
				const parser = new DOMParser();
				xml = parser.parseFromString( xmlStructure, 'application/xml' );
				const errorNode = xml.querySelector( 'parsererror' );
				if ( errorNode ) {
					throw new Error( 'Failed to parse XML structure: ' + errorNode.textContent );
				}

				const children = Array.from( xml.children );
				const iterate = ( node: Element, containerElement: V1Element ) => {
					const elementTag = node.tagName;
					if ( ! widgetsCache[ elementTag ] ) {
						errors.push( new Error( `Unknown widget type: ${ elementTag }` ) );
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
									id: generateElementId(),
								},
								options: { useHistory: false },
						  } );
					node.setAttribute( 'id', newElement.id );
					const configId = node.getAttribute( 'configuration-id' ) || '';
					try {
						const configObject = elementConfig[ configId ] || {};
						const styleObject = stylesConfig[ configId ] || {};
						configObject._styles = styleObject;
						for ( const [ propertyName, propertyValue ] of Object.entries( configObject ) ) {
							try {
								doUpdateElementProperty( {
									elementId: newElement.id,
									propertyName,
									propertyValue: propertyValue as unknown as PropValue,
									elementType: elementTag,
								} );
							} catch ( error ) {
								errors.push( error as Error );
							}
						}
						if ( isContainer ) {
							for ( const child of node.children ) {
								iterate( child, newElement );
							}
						} else {
							node.innerHTML = '';
							node.removeAttribute( 'configuration' );
						}
					} catch ( error ) {
						errors.push(
							new Error(
								`Invalid configuration JSON for element <${ elementTag }>: ${
									( error as Error ).message
								}`
							)
						);
					}
				};

				for ( const childNode of children ) {
					try {
						iterate( childNode, rootContainer );
					} catch ( error ) {
						errors.push( error as Error );
					}
				}
			} catch ( error ) {
				errors.push( error as Error );
			}

			if ( errors.length ) {
				deleteElement( {
					elementId: rootContainer.id,
					options: { useHistory: false },
				} );
			}

			if ( errors.length > 0 ) {
				return {
					errors: errors.map( ( e ) => e.message ).join( '\n\n' ),
				};
			}
			if ( ! xml ) {
				return {
					errors: 'Failed to parse XML structure.',
				};
			}
			return {
				xmlStructure: new XMLSerializer().serializeToString( xml ),
			};
		},
	} );
};
