import { type Props } from '@elementor/editor-props';
import { type BreakpointId } from '@elementor/editor-responsive';

export type StyleDefinitionState =
	| null
	| 'hover'
	| 'focus'
	| 'active'
	| 'visited'
	| 'disabled'
	| 'checked'
	| 'selected'
	| 'hidden'
	| 'visible';

export type StyleDefinitionVariant = {
	meta: {
		breakpoint: null | BreakpointId;
		state: StyleDefinitionState;
	};
	props: Props;
};

export type StyleDefinitionType = 'class';

export type StyleDefinitionID = string;

export type StyleDefinition = {
	id: StyleDefinitionID;
	variants: StyleDefinitionVariant[];
	label: string;
	type: StyleDefinitionType;
};

export type StyleDefinitionsMap = Record< StyleDefinition[ 'id' ], StyleDefinition >;
