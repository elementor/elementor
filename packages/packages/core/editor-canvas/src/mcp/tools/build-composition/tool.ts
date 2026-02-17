import {
	createElement,
	deleteElement,
	getContainer,
	getWidgetsCache,
	type V1Element,
} from '@elementor/editor-elements';
import { type MCPRegistryEntry } from '@elementor/editor-mcp';

import { CompositionBuilder } from '../../../composition-builder/composition-builder';
import { BEST_PRACTICES_URI, STYLE_SCHEMA_URI, WIDGET_SCHEMA_URI } from '../../resources/widgets-schema-resource';
import { doUpdateElementProperty } from '../../utils/do-update-element-property';
import { generatePrompt } from './prompt';
import { inputSchema as schema } from './schema';

export const initBuildCompositionsTool = ( reg: MCPRegistryEntry ) => {
	const { addTool } = reg;

	addTool( {
		name: 'build-compositions',
		description: generatePrompt(),
		schema,
		requiredResources: [
			{ description: 'Widgets schema', uri: WIDGET_SCHEMA_URI },
			{ description: 'Styles schema', uri: STYLE_SCHEMA_URI },
			{ description: 'Global Classes', uri: 'elementor://global-classes' },
			{ description: 'Global Variables', uri: 'elementor://global-variables' },
			{ description: 'Styles best practices', uri: BEST_PRACTICES_URI },
		],
		// outputSchema: '',
		modelPreferences: {
			hints: [ { name: 'claude-sonnet-4-5' } ],
		},
		handler: async ( params ) => {
			const { xmlStructure, elementConfig, stylesConfig } = params;
			let generatedXML: string = '';
			const errors: Error[] = [];
			const rootContainers: V1Element[] = [];
			const documentContainer = getContainer( 'document' ) as unknown as V1Element;
			try {
				const compositionBuilder = CompositionBuilder.fromXMLString( xmlStructure, {
					createElement,
					getWidgetsCache,
				} );
				compositionBuilder.setElementConfig( elementConfig );
				compositionBuilder.setStylesConfig( stylesConfig );

				const {
					configErrors,
					invalidStyles,
					rootContainers: generatedRootContainers,
				} = compositionBuilder.build( documentContainer );

				generatedXML = new XMLSerializer().serializeToString( compositionBuilder.getXML() );

				if ( configErrors.length ) {
					errors.push( ...configErrors.map( ( e ) => new Error( e ) ) );
					throw new Error( 'Configuration errors occurred during composition building.' );
				}

				rootContainers.push( ...generatedRootContainers );

				Object.entries( invalidStyles ).forEach( ( [ elementId, rawCssRules ] ) => {
					const customCss = {
						value: rawCssRules.join( ';\n' ),
					};
					doUpdateElementProperty( {
						elementId,
						propertyName: '_styles',
						propertyValue: {
							_styles: {
								custom_css: customCss,
							},
						},
						elementType: 'widget',
					} );
				} );
			} catch ( error ) {
				errors.push( error as Error );
			}

			if ( errors.length ) {
				rootContainers.forEach( ( rootContainer ) => {
					deleteElement( {
						container: rootContainer,
						options: { useHistory: false },
					} );
				} );

				const errorMessages = errors
					.map( ( e ) => {
						if ( typeof e === 'string' ) {
							return e;
						}
						if ( e instanceof Error ) {
							return e.message || String( e );
						}

						if ( typeof e === 'object' && e !== null ) {
							return JSON.stringify( e );
						}
						return String( e );
					} )
					.filter(
						( msg ) => msg && msg.trim() !== '' && msg !== '{}' && msg !== 'null' && msg !== 'undefined'
					);

				if ( errorMessages.length === 0 ) {
					throw new Error(
						'Failed to build composition: Unknown error occurred. No error details available.'
					);
				}

				const errorText = `Failed to build composition with the following errors:\n\n${ errorMessages.join(
					'\n\n'
				) }\n\n"Missing $$type" errors indicate that the configuration objects are invalid. Try again and apply **ALL** object entries with correct $$type.\nNow that you have these errors, fix them and try again. Errors regarding configuration objects, please check against the PropType schemas`;
				throw new Error( errorText );
			}
			if ( errors.length ) {
				throw new Error( errors.map( ( e ) => ( typeof e === 'string' ? e : e.message ) ).join( '\n' ) );
			}
			// Why text? Until there will be a stable versioning to OutputSchema, it is better to send string to the response.
			return `The composition was built successfully with element IDs embedded in the XML.

**CRITICAL NEXT STEPS** (Follow in order):
1. **Apply Global Classes**: Use "apply-global-class" tool to apply the global classes you created BEFORE building this composition
   - Check the created element IDs in the returned XML
   - Apply semantic classes (heading-primary, button-cta, etc.) to appropriate elements

2. **Fine-tune if needed**: Use "configure-element" tool only for element-specific adjustments that don't warrant global classes

Remember: Global classes ensure design consistency and reusability. Don't skip applying them!

Updated XML structure:
${ generatedXML }
`;
		},
	} );
};
