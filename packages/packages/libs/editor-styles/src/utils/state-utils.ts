import { type StyleDefinitionClassState, type StyleDefinitionPseudoState, type StyleDefinitionState } from '../types';

const PSEUDO_STATES: StyleDefinitionPseudoState[] = [ 'hover', 'focus', 'active' ];

const CLASS_STATES: StyleDefinitionClassState[] = [ 'e--selected' ];

export function isClassState( state: StyleDefinitionState ): state is StyleDefinitionClassState {
	return CLASS_STATES.includes( state as StyleDefinitionClassState );
}

export function isPseudoState( state: StyleDefinitionState ): state is StyleDefinitionPseudoState {
	return PSEUDO_STATES.includes( state as StyleDefinitionPseudoState );
}
