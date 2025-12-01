import { doApplyClasses, doGetAppliedClasses, doUnapplyClass } from '@elementor/editor-editing-panel';
import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { stylesRepository } from '@elementor/editor-styles-repository';
import { z } from '@elementor/schema';

export default function initMcpApplyUnapplyGlobalClasses( server: MCPRegistryEntry ) {
	server.addTool( {
		name: 'list-all-global-classes',
		description: `List all classes applied to a specific element

## When to use this tool:
- When a user requests to see which classes or global classes exists.
- When you need the list of global classes to allow the user to select from.
- At least once before applying or unapplying a class, to ensure the class ID is correct.

`,
		outputSchema: {
			appliedClasses: z.array(
				z.object( {
					id: z.string().describe( 'The ID of the class' ),
					label: z.string().describe( 'The label of the class' ),
					variants: z.array(
						z.object( {
							meta: z.object( {
								breakpoint: z.string().optional(),
								state: z.string().optional(),
							} ),
							props: z.record( z.any() ),
						} )
					),
				} )
			),
		},
		handler: async () => {
			const globalClassesProvider = stylesRepository.getProviderByKey( 'global-classes' );
			if ( ! globalClassesProvider ) {
				throw new Error( 'Global classes provider not found' );
			}
			const result: {
				id: string;
				label: string;
				variants: {
					meta: { breakpoint?: string | undefined; state?: string | undefined };
					props: Record< string, unknown >;
				}[];
			}[] = [];
			globalClassesProvider.actions.all().forEach( ( style ) => {
				const { id, label, variants } = style;
				result.push( {
					id,
					label,
					variants: variants.map( ( variant ) => ( {
						meta: {
							breakpoint: variant.meta.breakpoint as string | undefined,
							state: variant.meta.state as string | undefined,
						},
						props: variant.props as Record< string, unknown >,
					} ) ),
				} );
			} );
			return { appliedClasses: result };
		},
	} );

	server.addTool( {
		schema: {
			classId: z.string().describe( 'The ID of the class to apply' ),
			elementId: z.string().describe( 'The ID of the element to which the class will be applied' ),
		},
		name: 'apply-global-class',
		description: `Apply a global class to the current element

## When to use this tool:
- When a user requests to apply a global class or a class to an element in the Elementor editor.
- When you need to add a specific class to an element's applied classes.

## Prerequisites:
- Ensure you have the most up-to-date list of classes applied to the element to avoid duplicates. You can use the "list-applied-classes" tool to fetch the current classes.
- Make sure you have the correct class ID that you want to apply.`,
		handler: async ( params ) => {
			const { classId, elementId } = params;
			const appliedClasses = doGetAppliedClasses( elementId );
			doApplyClasses( elementId, [ ...appliedClasses, classId ] );
			return `Class ${ classId } applied to element ${ elementId } successfully.`;
		},
	} );

	server.addTool( {
		name: 'unapply-global-class',
		schema: {
			classId: z.string().describe( 'The ID of the class to unapply' ),
			elementId: z.string().describe( 'The ID of the element from which the class will be unapplied' ),
		},
		description: `Unapply a (global) class from the current element

## When to use this tool:
- When a user requests to unapply a global class or a class from an element in the Elementor editor.
- When you need to remove a specific class from an element's applied classes.

## Prerequisites:
- Ensure you have the most up-to-date list of classes applied to the element to avoid errors. You can use the "list-global-classes" tool to fetch the all classes applied to all elements.
- Make sure you have the correct class ID that you want to unapply.

<note>
If the user want to unapply a class by it's name and not ID, please use the "list-global-classes" tool to get the class ID from the name first.
</note>
`,
		handler: async ( params ) => {
			const { classId, elementId } = params;
			const ok = doUnapplyClass( elementId, classId );
			if ( ! ok ) {
				throw new Error( `Class ${ classId } is not applied to element ${ elementId }, cannot unapply it.` );
			}
			return `Class ${ classId } unapplied from element ${ elementId } successfully.`;
		},
	} );
}
