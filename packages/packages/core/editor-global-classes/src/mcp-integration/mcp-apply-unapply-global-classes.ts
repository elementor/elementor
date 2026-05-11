import { doApplyClasses, doGetAppliedClasses, doUnapplyClass } from '@elementor/editor-editing-panel';
import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { z } from '@elementor/schema';

import { APPLY_GLOBAL_CLASS_GUIDE_URI, generateApplyGlobalClassGuidePrompt } from './apply-global-class-guide-prompt';
import { GLOBAL_CLASSES_URI } from './classes-resource';

export default function initMcpApplyUnapplyGlobalClasses( server: MCPRegistryEntry ) {
	const { addTool, resource } = server;
	const applyGlobalClassGuideText = generateApplyGlobalClassGuidePrompt();

	resource(
		'apply-global-class-guide',
		APPLY_GLOBAL_CLASS_GUIDE_URI,
		{
			description: 'Workflow, prerequisites, and best practices for apply-global-class',
			mimeType: 'text/plain',
			title: 'Apply global class tool guide',
		},
		async ( uri ) => ( {
			contents: [ { mimeType: 'text/plain', text: applyGlobalClassGuideText, uri: uri.href } ],
		} )
	);

	addTool( {
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
		description: `Apply a global class to an element for shared design-system styling. Read the full guide at [${ APPLY_GLOBAL_CLASS_GUIDE_URI }].`,
		requiredResources: [
			{ description: 'Apply global class tool guide', uri: APPLY_GLOBAL_CLASS_GUIDE_URI },
			{ description: 'Global classes list', uri: GLOBAL_CLASSES_URI },
		],
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

	addTool( {
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
		description: `Unapply a global class from an element by class ID. Resolve class names to IDs via [${ GLOBAL_CLASSES_URI }].`,
		requiredResources: [ { description: 'Global classes list', uri: GLOBAL_CLASSES_URI } ],
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
