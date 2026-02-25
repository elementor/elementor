import { doApplyClasses, doGetAppliedClasses, doUnapplyClass } from '@elementor/editor-editing-panel';
import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { z } from '@elementor/schema';

export default function initMcpApplyUnapplyGlobalClasses( server: MCPRegistryEntry ) {
	server.addTool( {
		schema: {
			classId: z.string().describe( 'The ID of the class to apply' ),
			elementId: z.string().describe( 'The ID of the element to which the class will be applied' ),
		},
		outputSchema: {
			result: z.string().describe( 'Result message indicating the success of the apply operation' ),
			llm_instructions: z
				.string()
				.describe( 'Instructions what to do next, Important to follow these instructions!' ),
		},
		name: 'apply-global-class',
		modelPreferences: {
			intelligencePriority: 0.7,
			speedPriority: 0.8,
		},
		description: `Apply a global class to an element, enabling consistent styling through your design system.

## When to use this tool:
**ALWAYS use this IMMEDIATELY AFTER building compositions** to apply the global classes you created beforehand:
- After using "build-compositions" tool, apply semantic classes to the created elements
- When applying consistent typography styles (heading-primary, text-body, etc.)
- When applying theme colors or brand styles (bg-brand, button-cta, etc.)
- When ensuring spacing consistency (spacing-section-large, etc.)

**DO NOT use this tool** for:
- Elements that don't share styles with other elements (use inline styles instead)
- Layout-specific properties (those should remain inline in stylesConfig)

## Prerequisites:
- **REQUIRED**: Get the list of available global classes from 'elementor://global-classes' resource
- **REQUIRED**: Get element IDs from the composition XML returned by "build-compositions" tool
- Ensure you have the most up-to-date list of classes applied to the element to avoid duplicates
- Make sure you have the correct class ID that you want to apply

## Best Practices:
1. Apply multiple classes to a single element if needed (typography + color + spacing)
2. After applying, the tool will remind you to remove duplicate inline styles from elementConfig
3. Classes should describe purpose, not implementation (e.g., "heading-primary" not "big-red-text")`,
		handler: async ( params ) => {
			const { classId, elementId } = params;
			const appliedClasses = doGetAppliedClasses( elementId );
			doApplyClasses( elementId, [ ...appliedClasses, classId ] );
			return {
				llm_instructions:
					'Please check the element-configuration, find DUPLICATES in the style schema that are in the class, and remove them',
				result: `Class ${ classId } applied to element ${ elementId } successfully.`,
			};
		},
	} );

	server.addTool( {
		name: 'unapply-global-class',
		schema: {
			classId: z.string().describe( 'The ID of the class to unapply' ),
			elementId: z.string().describe( 'The ID of the element from which the class will be unapplied' ),
		},
		outputSchema: {
			result: z.string().describe( 'Result message indicating the success of the unapply operation' ),
		},
		modelPreferences: {
			intelligencePriority: 0.7,
			speedPriority: 0.8,
		},
		description: `Unapply a (global) class from the current element

## When to use this tool:
- When a user requests to unapply a global class or a class from an element in the Elementor editor.
- When you need to remove a specific class from an element's applied classes.

## Prerequisites:
- Ensure you have the most up-to-date list of classes applied to the element to avoid errors.
  The list is available at always up-to-date resource 'elementor://global-classes'.
- Make sure you have the correct class ID that you want to unapply.

<note>
If the user want to unapply a class by it's name and not ID, retreive the id from the list, available at uri elementor://global-classes
</note>
`,
		handler: async ( params ) => {
			const { classId, elementId } = params;
			const ok = doUnapplyClass( elementId, classId );
			if ( ! ok ) {
				throw new Error( `Class ${ classId } is not applied to element ${ elementId }, cannot unapply it.` );
			}
			return {
				result: `Class ${ classId } unapplied from element ${ elementId } successfully.`,
			};
		},
	} );
}
