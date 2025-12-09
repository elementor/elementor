import { type Props } from '@elementor/editor-props';
import { type BreakpointId } from '@elementor/editor-responsive';

export type ClassState = {
	name: 'selected';
	value: 'e--selected';
};

export type StyleDefinitionAlternativePseudoState = 'focus-visible';

export type StyleDefinitionPseudoState = 'hover' | 'focus' | 'active' | StyleDefinitionAlternativePseudoState;

export type StyleDefinitionClassState = ClassState[ 'value' ];

export type StyleDefinitionStateType = StyleDefinitionPseudoState | StyleDefinitionClassState;

export type StyleDefinitionState = null | Exclude< StyleDefinitionStateType, StyleDefinitionAlternativePseudoState >;

export type CustomCss = {
	raw: string;
};

export type StyleDefinitionVariant = {
	meta: {
		breakpoint: null | BreakpointId;
		state: StyleDefinitionState;
	};
	props: Props;
	custom_css: CustomCss | null;
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
