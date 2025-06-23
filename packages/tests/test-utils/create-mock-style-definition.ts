import { type Props } from '@elementor/editor-props';
import { type BreakpointId } from '@elementor/editor-responsive';
import { type StyleDefinition, type StyleDefinitionID, type StyleDefinitionState } from '@elementor/editor-styles';

type Options = {
	props?: Props;
	id?: StyleDefinitionID;
	label?: string;
	meta?: {
		breakpoint: BreakpointId | null;
		state: StyleDefinitionState;
	};
};

export function createMockStyleDefinition( {
	props = {},
	id,
	label,
	meta = {
		breakpoint: null,
		state: null,
	},
}: Options = {} ): StyleDefinition {
	return {
		id: id ?? generateId( 's-' ),
		type: 'class',
		label: label ?? 'Style Label',
		variants: [
			{
				meta,
				props,
			},
		],
	};
}

type OptionsWithVariants = Omit< Options, 'props' | 'meta' > & {
	variants?: {
		meta: {
			breakpoint: string | null;
			state: string | null;
		};
		props: Props;
	}[];
};

export function createMockStyleDefinitionWithVariants( {
	id,
	label,
	variants = [
		{
			meta: {
				breakpoint: null,
				state: null,
			},
			props: {},
		},
	],
}: OptionsWithVariants ): StyleDefinition {
	return {
		id: id ?? generateId( 's-' ),
		type: 'class',
		label: label ?? 'Style Label',
		variants,
	} as StyleDefinition;
}

function generateId( prefix: string = '', existingIds: string[] = [] ) {
	let id: string;

	do {
		id = prefix + Math.random().toString( 16 ).slice( 2, 9 );
	} while ( existingIds.includes( id ) );

	return id;
}
