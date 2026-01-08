import { DOCUMENT_STRUCTURE_URI, WIDGET_SCHEMA_URI } from '@elementor/editor-canvas';
import { getContainer, getElementType, getWidgetsCache, type V1ElementData } from '@elementor/editor-elements';
import { getMCPByDomain, toolPrompts } from '@elementor/editor-mcp';
import { type PropValue } from '@elementor/editor-props';
import { AxiosError } from '@elementor/http-client';
import { z } from '@elementor/schema';
import { generateUniqueId } from '@elementor/utils';

import { apiClient } from '../api';
import { createUnpublishedComponent } from '../store/actions/create-unpublished-component';
import { type OverridableProps } from '../types';

const InputSchema = {
	element_id: z
		.string()
		.describe(
			'The unique identifier of the element to save as a component. ' +
				'Use the "list-elements" tool to find available element IDs in the current document.'
		),
	component_name: z
		.string()
		.describe( 'The name for the new component. Should be descriptive and unique among existing components.' ),
	overridable_props: z
		.object( {
			props: z.record(
				z.object( {
					elementId: z
						.string()
						.describe( 'The id of the child element that you want to override its settings' ),
					propKey: z
						.string()
						.describe(
							'The property key of the child element that you want to override its settings (e.g., "text", "url", "tag"). To get the available propKeys for an element, use the "get-element-type-config" tool.'
						),
					label: z
						.string()
						.describe(
							'A unique, user-friendly display name for this property (e.g., "Hero Headline", "CTA Button Text"). Must be unique within the same component.'
						),
				} )
			),
		} )
		.optional()
		.describe(
			'Overridable properties configuration. Specify which CHILD element properties can be customized. ' +
				'Only elementId and propKey are required; To get the available propKeys for a child element you must use the "get-element-type-config" tool.'
		),
};

const OutputSchema = {
	message: z.string().optional().describe( 'Additional information about the operation result' ),
	component_uid: z
		.string()
		.optional()
		.describe( 'The unique identifier of the newly created component (only present on success)' ),
};

export const ERROR_MESSAGES = {
	ELEMENT_NOT_FOUND: "Element not found. Use 'list-elements' to get valid element IDs.",
	ELEMENT_NOT_ONE_OF_TYPES: ( validTypes: string[] ) =>
		`Element is not one of the following types: ${ validTypes.join( ', ' ) }`,
	ELEMENT_IS_LOCKED: 'Cannot save a locked element as a component.',
};

export const handleSaveAsComponent = async ( params: z.infer< z.ZodObject< typeof InputSchema > > ) => {
	const { element_id: elementId, component_name: componentName, overridable_props: overridablePropsInput } = params;
	const validElementTypes = getValidElementTypes();
	const container = getContainer( elementId );

	if ( ! container ) {
		throw new Error( ERROR_MESSAGES.ELEMENT_NOT_FOUND );
	}

	const elType = container.model.get( 'elType' );

	if ( ! validElementTypes.includes( elType ) ) {
		throw new Error( ERROR_MESSAGES.ELEMENT_NOT_ONE_OF_TYPES( validElementTypes ) );
	}

	const element = container.model.toJSON( { remove: [ 'default' ] } ) as V1ElementData;

	if ( element?.isLocked ) {
		throw new Error( ERROR_MESSAGES.ELEMENT_IS_LOCKED );
	}

	const overridableProps = overridablePropsInput
		? enrichOverridableProps( overridablePropsInput, element )
		: undefined;

	if ( overridableProps ) {
		updateElementDataWithOverridableProps( element, overridableProps );
	}

	const uid = generateUniqueId( 'component' );

	try {
		await apiClient.validate( {
			items: [
				{ uid, title: componentName, elements: [ element ], settings: { overridable_props: overridableProps } },
			],
		} );
	} catch ( error: unknown ) {
		if ( error instanceof AxiosError ) {
			throw new Error( error.response?.data.messge );
		}
		throw new Error( 'Unknown error' );
	}

	createUnpublishedComponent( componentName, element, null, overridableProps, uid );

	return {
		status: 'ok' as const,
		message: `Component "${ componentName }" created successfully.`,
		component_uid: uid,
	};
};

function enrichOverridableProps(
	input: { props: Record< string, { elementId: string; propKey: string; label: string } > },
	rootElement: V1ElementData
): OverridableProps {
	const enrichedProps: OverridableProps[ 'props' ] = {};
	const defaultGroupId = generateUniqueId( 'group' );

	Object.entries( input.props ).forEach( ( [ , prop ] ) => {
		const { elementId, propKey, label } = prop;
		const element = findElementById( rootElement, elementId );

		if ( ! element ) {
			throw new Error( `Element with ID "${ elementId }" not found in component` );
		}

		const elType = element.elType;
		const widgetType = element.widgetType || element.elType;

		// Validate that the propKey exists in the element's schema
		const elementType = getElementType( widgetType );

		if ( ! elementType ) {
			throw new Error(
				`Element type "${ widgetType }" is not atomic or does not have a settings schema. ` +
					`Cannot expose property "${ propKey }" for element "${ elementId }".`
			);
		}

		if ( ! elementType.propsSchema[ propKey ] ) {
			const availableProps = Object.keys( elementType.propsSchema ).join( ', ' );
			throw new Error(
				`Property "${ propKey }" does not exist in element "${ elementId }" (type: ${ widgetType }). ` +
					`Available properties: ${ availableProps }`
			);
		}

		const overrideKey = generateUniqueId( 'prop' );
		const originValue = element.settings?.[ propKey ]
			? ( element.settings[ propKey ] as PropValue )
			: elementType.propsSchema[ propKey ].default ?? null;

		enrichedProps[ overrideKey ] = {
			overrideKey,
			label,
			elementId,
			propKey,
			elType,
			widgetType,
			originValue,
			groupId: defaultGroupId,
		};
	} );

	return {
		props: enrichedProps,
		groups: {
			items: {
				[ defaultGroupId ]: {
					id: defaultGroupId,
					label: 'Default',
					props: Object.keys( enrichedProps ),
				},
			},
			order: [ defaultGroupId ],
		},
	};
}

function updateElementDataWithOverridableProps( rootElement: V1ElementData, overridableProps: OverridableProps ) {
	Object.values( overridableProps.props ).forEach( ( prop ) => {
		const element = findElementById( rootElement, prop.elementId );

		if ( ! element || ! element.settings ) {
			return;
		}

		element.settings[ prop.propKey ] = {
			$$type: 'overridable',
			value: {
				override_key: prop.overrideKey,
				origin_value: prop.originValue,
			},
		};
	} );
}

function findElementById( root: V1ElementData, targetId: string ): V1ElementData | null {
	if ( root.id === targetId ) {
		return root;
	}

	if ( root.elements ) {
		for ( const child of root.elements ) {
			const found = findElementById( child, targetId );
			if ( found ) {
				return found;
			}
		}
	}

	return null;
}

function getValidElementTypes(): string[] {
	const types = getWidgetsCache();

	if ( ! types ) {
		return [];
	}

	return Object.entries( types ).reduce( ( acc, [ type, value ] ) => {
		if ( ! value.atomic_props_schema || ! value.show_in_panel || value.elType === 'widget' ) {
			return acc;
		}

		acc.push( type );
		return acc;
	}, [] as string[] );
}

const generatePrompt = () => {
	const saveAsComponentPrompt = toolPrompts( 'save-as-component' );

	saveAsComponentPrompt.description( `
Save an existing element as a reusable component in the Elementor editor.

# When to use this tool
Use this tool when the user wants to:
- Create a reusable component from an existing element structure
- Make specific child element properties customizable in component instances
- Build a library of reusable design patterns

# When NOT to use this tool
- Element is already a component (widgetType: 'e-component')
- Element is locked
- Element is not an atomic element (atomic_props_schema is not defined)
- Element elType is a 'widget'

# **CRITICAL - REQUIRED RESOURCES (Must read before using this tool)**
1. [${ DOCUMENT_STRUCTURE_URI }]
   **MANDATORY** - Required to understand the document structure and identify child elements for overridable properties.
   Use this resource to find element IDs and understand the element hierarchy.

2. [${ WIDGET_SCHEMA_URI }]
   **MANDATORY** - Required to understand which properties are available for each widget type.
   Use this to identify available propKeys in the atomic_props_schema for child elements.

# Instructions - MUST FOLLOW IN ORDER
## Step 1: Identify the Target Element
1. Read the [${ DOCUMENT_STRUCTURE_URI }] resource to understand the document structure
2. Locate the element you want to save as a component by its element_id
3. Verify the element type is a valid element type
4. Ensure the element is not locked and is not already a component

## Step 2: Define Overridable Properties
Do this step to make child element properties customizable.
Skip that step ONLY if the user explicitly requests to not make any properties customizable.

1. **Identify Child Elements**
   - Use the [${ DOCUMENT_STRUCTURE_URI }] resource to find all child elements
   - Note the elementId and widgetType/elType of each child element you want to customize

2. **Find Available Properties**
   - Use the [${ WIDGET_SCHEMA_URI }] resource to find the child element's widget type schema
   - Review the atomic_props_schema to find available propKeys (ONLY use top-level props)
   - Common propKeys include: "text", "url", "tag", "size", etc.
   - Use only the top level properties, do not use nested properties.

3. **Build the overridable_props Object**
   - For each property you want to make overridable, add an entry:
     \`{ "elementId": "<child-element-id>", "propKey": "<property-key>", "label": "<user-friendly-name>" }\`
   - The label must be unique within the component and should be meaningful to the user (e.g., "Hero Headline", "CTA Button Text")
   - Group all entries under the "props" object

## Step 3: Execute the Tool
Call the tool with:
- element_id: The ID of the parent element to save as component
- component_name: A descriptive name for the component
- overridable_props: (Optional) The properties configuration from Step 2

# CONSTRAINTS
- NEVER try to override properties of the parent element itself - ONLY child elements
- NEVER use invalid propKeys - always verify against the widget's atomic_props_schema in [${ WIDGET_SCHEMA_URI }]
- Property keys must exist in the child element's atomic_props_schema
- Element IDs must exist within the target element's children
- When tool execution fails, read the error message and adjust accordingly
- The element being saved must not be inside another component
` );

	saveAsComponentPrompt.parameter(
		'element_id',
		`**MANDATORY** The unique identifier of the element to save as a component.
Use the [${ DOCUMENT_STRUCTURE_URI }] resource to find available element IDs.`
	);

	saveAsComponentPrompt.parameter(
		'component_name',
		`**MANDATORY** A descriptive name for the new component.
Should be unique and clearly describe the component's purpose (e.g., "Hero Section", "Feature Card").`
	);

	saveAsComponentPrompt.parameter(
		'overridable_props',
		`**OPTIONAL** Configuration for which child element properties can be customized in component instances.

Structure:
\`\`\`json
{
  "props": {
    "<unique-key>": {
      "elementId": "<child-element-id>",
      "propKey": "<property-key>",
      "label": "<user-friendly-name>"
    }
  }
}
\`\`\`

To populate this correctly:
1. Use [${ DOCUMENT_STRUCTURE_URI }] to find child element IDs and their widgetType
2. Use [${ WIDGET_SCHEMA_URI }] to find the atomic_props_schema for each child element's widgetType
3. Only include properties you want to be customizable in component instances
4. Provide a unique, user-friendly label for each property (e.g., "Hero Headline", "CTA Button Text")`
	);

	saveAsComponentPrompt.example( `
Basic component without overridable properties:
\`\`\`json
{
  "element_id": "abc123",
  "component_name": "Hero Section"
}
\`\`\`

Component with overridable properties:
\`\`\`json
{
  "element_id": "abc123",
  "component_name": "Feature Card",
  "overridable_props": {
    "props": {
      "heading-text": {
        "elementId": "heading-123",
        "propKey": "text",
        "label": "Card Title"
      },
      "button-text": {
        "elementId": "button-456",
        "propKey": "text",
        "label": "Button Text"
      },
      "button-link": {
        "elementId": "button-456",
        "propKey": "url",
        "label": "Button Link"
      }
    }
  }
}
\`\`\`
` );

	saveAsComponentPrompt.instruction(
		`After successful creation, the component will be available in the components library and can be inserted into any page or template.`
	);

	saveAsComponentPrompt.instruction(
		`When overridable properties are defined, component instances will show customization controls for those specific properties in the editing panel.`
	);

	return saveAsComponentPrompt.prompt();
};

export const initSaveAsComponentTool = () => {
	return getMCPByDomain( 'components' ).addTool( {
		name: 'save-as-component',
		schema: InputSchema,
		outputSchema: OutputSchema,
		description: generatePrompt(),
		handler: handleSaveAsComponent,
	} );
};
