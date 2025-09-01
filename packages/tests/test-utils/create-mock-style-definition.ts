import { type Props } from '@elementor/editor-props';
import { type BreakpointId } from '@elementor/editor-responsive';
import {
	type CustomCss,
	type StyleDefinition,
	type StyleDefinitionID,
	type StyleDefinitionState,
} from '@elementor/editor-styles';

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
				custom_css: null,
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
		custom_css: CustomCss | null;
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
			custom_css: null,
		},
	],
}: OptionsWithVariants ): StyleDefinition {
	return {
		id: id ?? generateId( 's-' ),
		type: 'class',
		label: label ?? 'Style Label',
		variants: variants.map( ( v ) => ( { ...v, custom_css: null } ) ),
	} as StyleDefinition;
}

function generateId( prefix: string = '', existingIds: string[] = [] ) {
	let id: string;

	do {
		id = prefix + Math.random().toString( 16 ).slice( 2, 9 );
	} while ( existingIds.includes( id ) );

	return id;
}
