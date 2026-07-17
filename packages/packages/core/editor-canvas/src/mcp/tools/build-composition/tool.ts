import { getCurrentDocument } from '@elementor/editor-documents';
import {
	createElement,
	deleteElement,
	getContainer,
	getWidgetsCache,
	type V1Element,
	type V1ElementData,
} from '@elementor/editor-elements';
import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { dispatchMcpStylesAppliedEvent } from '@elementor/editor-mcp';

import { CompositionBuilder, type SkippedProp } from '../../../composition-builder/composition-builder';
import { trackCanvasEvent } from '../../../utils/tracking';
import { AVAILABLE_WIDGETS_URI_V4 } from '../../resources/available-widgets-resource';
import { DYNAMIC_TAGS_URI } from '../../resources/dynamic-tags-resource';
import { BEST_PRACTICES_URI, WIDGET_SCHEMA_URI } from '../../resources/widgets-schema-resource';
import { convertStyleBlocksToAtomic } from '../../utils/convert-css-to-atomic';
import { isWidgetAvailableForLLM } from '../../utils/element-data-util';
import { getCompositionTargetContainer } from '../../utils/get-composition-target-container';
import { BUILD_COMPOSITIONS_GUIDE_URI, generatePrompt } from './prompt';
import { inputSchema as schema, outputSchema } from './schema';
import { adaptLeafRootParams } from './xml-leaf-wrapper';

export type ElementAddedEvent = {
	element: V1ElementData;
	executedBy: 'mcp_tool' | 'user';
};

export const ELEMENT_ADDED_EVENT = 'elementor/canvas/element-added';

export const initBuildCompositionsTool = ( reg: MCPRegistryEntry ) => {
	const { addTool, resource } = reg;

	resource(
		'build-compositions-guide',
		BUILD_COMPOSITIONS_GUIDE_URI,
		{
			title: 'Build Compositions Guide',
			description: 'Detailed guide for using the build-compositions tool',
			mimeType: 'text/plain',
		},
		async ( uri: URL ) => ( {
			contents: [ { uri: uri.href, mimeType: 'text/plain', text: generatePrompt() } ],
		} )
	);

	addTool( {
		name: 'build-compositions',
		description: 'Build V4 element compositions on the Elementor canvas. Read the guide resource before use.',
		schema,
		requiredResources: [
			{ description: 'Build compositions guide', uri: BUILD_COMPOSITIONS_GUIDE_URI },
			{ description: 'Widgets schema', uri: WIDGET_SCHEMA_URI },
			{ description: 'Global Classes', uri: 'elementor://global-classes' },
			{ description: 'Global Variables', uri: 'elementor://global-variables' },
			{ description: 'Styles best practices', uri: BEST_PRACTICES_URI },
			{ description: 'Available widgets for this tool', uri: AVAILABLE_WIDGETS_URI_V4 },
			{ description: 'Dynamic tags catalog', uri: DYNAMIC_TAGS_URI },
		],
		outputSchema,
		handler: async ( rawParams ) => {
			assertCompositionXmlUsesV4WidgetsOnly( rawParams.xmlStructure );
			const { stylesConfig: convertedStyles, customCSS } = await convertCompositionStyles( rawParams.style );
			const { xmlStructure, elementConfig, stylesConfig } = adaptLeafRootParams( {
				...rawParams,
				stylesConfig: convertedStyles,
				widgetsCache: getWidgetsCache() ?? {},
			} );

			let generatedXML: string = '';
			const errors: Error[] = [];
			const skippedProps: SkippedProp[] = [];
			const rootContainers: V1Element[] = [];
			const documentContainer = getContainer( 'document' ) as unknown as V1Element;
			const currentDocument = getCurrentDocument();
			const targetContainer = getCompositionTargetContainer( documentContainer, currentDocument?.type.value );
			try {
				const compositionBuilder = CompositionBuilder.fromXMLString( xmlStructure, {
					createElement,
					deleteElement,
					getWidgetsCache,
				} );
				compositionBuilder.setElementConfig( elementConfig );
				compositionBuilder.setStylesConfig( stylesConfig );
				compositionBuilder.setCustomCSS( customCSS );

				const {
					configErrors,
					formErrors,
					skippedProps: builderSkippedProps,
					rootContainers: generatedRootContainers,
				} = await compositionBuilder.build( targetContainer );

				skippedProps.push( ...builderSkippedProps );
				rootContainers.push( ...generatedRootContainers );
				generatedXML = new XMLSerializer().serializeToString( compositionBuilder.getXML() );

				rootContainers.forEach( ( container ) => {
					const elementData = container.model?.toJSON();

					if ( elementData ) {
						onElementAdded( elementData as V1ElementData );
					}
				} );

				Object.values( stylesConfig ).forEach( ( styleValue ) => {
					dispatchMcpStylesAppliedEvent( { styleValue } );
				} );

				if ( configErrors.length ) {
					errors.push( ...configErrors.map( ( msg ) => new Error( msg ) ) );
				}

				if ( formErrors.length ) {
					errors.push( ...formErrors.map( ( msg ) => new Error( msg ) ) );
				}
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
				) }`;
				throw new Error( errorText );
			}
			const warnings = formatSkippedPropsWarning( skippedProps );

			return {
				xmlStructure: generatedXML,
				errors: errors?.length
					? errors.map( ( e ) => ( typeof e === 'string' ? e : e.message ) ).join( '\n\n' )
					: undefined,
				warnings,
				llm_instructions: `The composition was built successfully with element IDs embedded in the XML.

**CRITICAL NEXT STEPS** (Follow in order):
1. **Apply Global Classes**: Use "apply-global-class" tool to apply the global classes you created BEFORE building this composition
   - Check the created element IDs in the returned XML
   - Apply semantic classes (heading-primary, button-cta, etc.) to appropriate elements

2. **Fine-tune if needed**: Use "configure-element" tool only for element-specific adjustments that don't warrant global classes

3. **Check "warnings"**: If present, some props were skipped because the target widget's schema does not support them (e.g. a "link" on a widget that has no link prop). Nothing was rolled back — decide whether to move the value to a supported element or inform the user.

Remember: Global classes ensure design consistency and reusability. Don't skip applying them!
`,
			};
		},
	} );
};

async function convertCompositionStyles( style: Record< string, Record< string, string > > ) {
	const stylesConfig: Record< string, Record< string, unknown > > = {};
	const customCSS: Record< string, string > = {};

	if ( ! style || Object.keys( style ).length === 0 ) {
		return { stylesConfig, customCSS };
	}

	const results = await convertStyleBlocksToAtomic( style );

	for ( const [ configId, { props, customCss } ] of Object.entries( results ) ) {
		stylesConfig[ configId ] = props;
		if ( customCss ) {
			customCSS[ configId ] = customCss;
		}
	}

	return { stylesConfig, customCSS };
}

function formatSkippedPropsWarning( skippedProps: SkippedProp[] ): string | undefined {
	if ( ! skippedProps.length ) {
		return undefined;
	}

	const details = skippedProps
		.map(
			( { configId, elementType, propertyName } ) =>
				`"${ propertyName }" on ${ elementType } (config id "${ configId }")`
		)
		.join( '; ' );

	return `Skipped unsupported props (the target widget's schema has no such prop; nothing was rolled back): ${ details }.`;
}

function assertCompositionXmlUsesV4WidgetsOnly( xmlStructure: string ) {
	const doc = new DOMParser().parseFromString( xmlStructure, 'application/xml' );
	if ( doc.querySelector( 'parsererror' ) ) {
		throw new Error( 'Failed to parse XML string: ' + doc );
	}
	const widgetsCache = getWidgetsCache() ?? {};
	for ( const node of doc.querySelectorAll( '*' ) ) {
		const type = node.tagName;
		const widgetData = widgetsCache[ type ];

		if ( ! widgetData ) {
			continue;
		}
		if ( widgetData.elType !== 'widget' ) {
			continue;
		}
		if ( ! isWidgetAvailableForLLM( widgetData ) || ! widgetData.atomic_props_schema ) {
			throw new Error( `This tool does not support element type: ${ type }` );
		}
	}
}

function onElementAdded( element: V1ElementData ) {
	const elType = element.elType ?? '';
	const widgetType = element.widgetType ?? '';
	const elementName = elType === 'widget' ? widgetType : elType;

	trackCanvasEvent( {
		eventName: 'add_element',
		executed_by: 'mcp_tool',
		element_name: elementName,
		element_type: elType,
		widget_type: widgetType,
	} );

	const event: ElementAddedEvent = {
		element,
		executedBy: 'mcp_tool',
	};

	window.dispatchEvent( new CustomEvent( ELEMENT_ADDED_EVENT, { detail: event } ) );

	if ( element.elements?.length ) {
		element.elements?.forEach( ( childElement ) => {
			onElementAdded( childElement );
		} );
	}
}
