import {
	createElement,
	deleteElement,
	generateElementId,
	getContainer,
	getWidgetsCache,
	type V1Element,
} from '@elementor/editor-elements';
import { type MCPRegistryEntry } from '@elementor/editor-mcp';

import { BEST_PRACTICES_URI, STYLE_SCHEMA_URI, WIDGET_SCHEMA_URI } from '../../resources/widgets-schema-resource';
import { doUpdateElementProperty } from '../../utils/do-update-element-property';
import { validateInput } from '../../utils/validate-input';
import { generatePrompt } from './prompt';
import { inputSchema as schema, outputSchema } from './schema';

export const initBuildCompositionsTool = ( reg: MCPRegistryEntry ) => {
	const { addTool } = reg;

	addTool( {
		name: 'build-compositions',
		description: generatePrompt(),
		schema,
		requiredResources: [
			{ description: 'Widgets schema', uri: WIDGET_SCHEMA_URI },
			{ description: 'Global Classes', uri: 'elementor://global-classes' },
			{ description: 'Styles schema', uri: STYLE_SCHEMA_URI },
			{ description: 'Global Variables', uri: 'elementor://global-variables' },
			{ description: 'Styles best practices', uri: BEST_PRACTICES_URI },
		],
		outputSchema,
		modelPreferences: {
			hints: [ { name: 'claude-sonnet' } ],
			intelligencePriority: 0.95,
			speedPriority: 0.5,
		},
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
				const iterate = async (
					node: Element,
					containerElement: V1Element = documentContainer,
					childIndex: number
				) => {
					const elementTag = node.tagName;
					if ( ! widgetsCache[ elementTag ] ) {
						errors.push( new Error( `Unknown widget type: ${ elementTag }` ) );
					}
					const CONTAINER_ELEMENTS = Object.values( widgetsCache )
						.filter( ( widget ) => widget.meta?.is_container )
						.map( ( widget ) => widget.elType );
					const isContainer = CONTAINER_ELEMENTS.includes( elementTag );
					const parentElType = containerElement.model.get( 'elType' );
					let targetContainerId =
						parentElType === 'e-tabs'
							? containerElement.children?.[ 1 ].children?.[ childIndex ]?.id ||
							  containerElement.children?.[ 1 ].id
							: containerElement.id;
					if ( ! targetContainerId ) {
						targetContainerId = containerElement.id;
					}
					const newElement = isContainer
						? createElement( {
								containerId: targetContainerId,
								model: {
									elType: elementTag,
									id: generateElementId(),
								},
								options: { useHistory: false },
						  } )
						: createElement( {
								containerId: targetContainerId,
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
						const { errors: propsValidationErrors } = validateInput.validatePropSchema(
							elementTag,
							configObject
						);
						errors.push( ...( propsValidationErrors || [] ).map( ( msg ) => new Error( msg ) ) );
						const { errors: stylesValidationErrors } = validateInput.validateStyles( styleObject );
						errors.push( ...( stylesValidationErrors || [] ).map( ( msg ) => new Error( msg ) ) );

						if ( propsValidationErrors?.length || stylesValidationErrors?.length ) {
							return;
						}
						configObject._styles = styleObject || {};
						for ( const [ propertyName, propertyValue ] of Object.entries( configObject ) ) {
							try {
								doUpdateElementProperty( {
									elementId: newElement.id,
									propertyName,
									propertyValue,
									elementType: elementTag,
								} );
							} catch ( error ) {
								softErrors.push( error as Error );
							}
						}
						if ( isContainer ) {
							let currentChild = 0;
							for ( const child of node.children ) {
								iterate( child, newElement, currentChild );
								currentChild++;
							}
						} else {
							node.innerHTML = '';
							node.removeAttribute( 'configuration' );
						}
					} finally {
					}
				};

				let currentChild = 0;
				for await ( const childNode of children ) {
					await iterate( childNode, documentContainer, currentChild );
					currentChild++;
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
				const errorText = `Failed to build composition with the following errors:\n\n
${ errors.map( ( e ) => ( typeof e === 'string' ? e : e.message ) ).join( '\n\n' ) }
"Missing $$type" errors indicate that the configuration objects are invalid. Try again and apply **ALL** object entries with correct $$type.
Now that you have these errors, fix them and try again. Errors regarding configuration objects, please check against the PropType schemas`;
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
