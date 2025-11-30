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

import { doUpdateElementProperty } from '../../utils/do-update-element-property';
import { generatePrompt } from './prompt';
import { inputSchema as schema, outputSchema } from './schema';

export const initBuildCompositionsTool = ( reg: MCPRegistryEntry ) => {
	const { addTool } = reg;

	addTool( {
		name: 'build-compositions',
		description: generatePrompt(),
		schema,
		outputSchema,
		handler: async ( params ) => {
			let xml: Document | null = null;
			const { xmlStructure, elementConfig, stylesConfig } = params;
			const errors: Error[] = [];
			const softErrors: Error[] = [];
			const rootContainers: V1Element[] = [];
			const widgetsCache = getWidgetsCache() || {};
			const documentContainer = getContainer( 'document' ) as unknown as V1Element;
			try {
				const parser = new DOMParser();
				xml = parser.parseFromString( xmlStructure, 'application/xml' );
				const errorNode = xml.querySelector( 'parsererror' );
				if ( errorNode ) {
					throw new Error( 'Failed to parse XML structure: ' + errorNode.textContent );
				}

				const children = Array.from( xml.children );
				const iterate = ( node: Element, containerElement: V1Element = documentContainer ) => {
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
					if ( containerElement === documentContainer ) {
						rootContainers.push( newElement );
					}
					node.setAttribute( 'id', newElement.id );
					const configId = node.getAttribute( 'configuration-id' ) || '';
					try {
						const configObject = elementConfig[ configId ] || {};
						const styleObject = stylesConfig[ configId ] || {};
						configObject._styles = styleObject;
						for ( const [ propertyName, propertyValue ] of Object.entries( configObject ) ) {
							// validate property existance
							const widgetSchema = widgetsCache[ elementTag ];
							if (
								! widgetSchema?.atomic_props_schema?.[ propertyName ] &&
								propertyName !== '_styles' &&
								propertyName !== 'custom_css'
							) {
								softErrors.push(
									new Error(
										`Property "${ propertyName }" does not exist on element type "${ elementTag }".`
									)
								);
								continue;
							}
							try {
								doUpdateElementProperty( {
									elementId: newElement.id,
									propertyName,
									propertyValue:
										propertyName === 'custom_css'
											? { _styles: propertyValue }
											: ( propertyValue as unknown as PropValue ),
									elementType: elementTag,
								} );
							} catch ( error ) {
								softErrors.push( error as Error );
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
					} finally {
					}
				};

				for ( const childNode of children ) {
					iterate( childNode, documentContainer );
					try {
					} catch ( error ) {
						errors.push( error as Error );
					}
				}
			} catch ( error ) {
				errors.push( error as Error );
			}

			if ( errors.length ) {
				rootContainers.forEach( ( rootContainer ) => {
					deleteElement( {
						elementId: rootContainer.id,
						options: { useHistory: false },
					} );
				} );
			}

			if ( errors.length > 0 ) {
				const errorText = `Failed to build composition with the following errors:\n\n
${ errors.map( ( e ) => ( typeof e === 'string' ? e : e.message ) ).join( '\n\n' ) }
"Missing $$type" errors indicate that the configuration objects are invalid. Try again and apply **ALL** object entries with correct $$type.
Now that you have these errors, fix them and try again. Errors regarding configuration objects, please check again the PropType schemas`;
				throw new Error( errorText );
			}
			if ( ! xml ) {
				throw new Error( 'XML structure is null after parsing.' );
			}
			return {
				xmlStructure: new XMLSerializer().serializeToString( xml ),
				llmInstructions:
					( softErrors.length
						? `The composition was built successfully, but there were some issues with the provided configurations:

${ softErrors.map( ( e ) => `- ${ e.message }` ).join( '\n' ) }

Please use confiugure-element tool to fix these issues. Now that you have information about these issues, use the configure-element tool to fix them!`
						: '' ) +
					`
Next Steps:
- Use "apply-global-class" tool as there may be global styles ready to be applied to elements.
- Use "configure-element" tool to further configure elements as needed, including styles.
`,
			};
		},
	} );
};
