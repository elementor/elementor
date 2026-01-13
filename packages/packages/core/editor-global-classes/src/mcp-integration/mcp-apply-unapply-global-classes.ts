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
		},
		name: 'apply-global-class',
		modelPreferences: {
			intelligencePriority: 0.7,
			speedPriority: 0.8,
		},
		description: `Apply a global class to the current element

## When to use this tool:
- When a user requests to apply a global class or a class to an element in the Elementor editor.
- When you need to add a specific class to an element's applied classes.

## Prerequisites:
- Ensure you have the most up-to-date list of classes applied to the element to avoid duplicates.
  List available at always up-to-date resource 'elementor://global-classes'.
- Make sure you have the correct class ID that you want to apply.`,
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
