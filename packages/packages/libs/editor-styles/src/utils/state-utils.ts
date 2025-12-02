import {
	type StyleDefinitionAlternativePseudoState,
	type StyleDefinitionClassState,
	type StyleDefinitionPseudoState,
	type StyleDefinitionState,
} from '../types';

const PSEUDO_STATES: StyleDefinitionPseudoState[] = [ 'hover', 'focus', 'active', 'focus-visible' ];

const CLASS_STATES: StyleDefinitionClassState[] = [ 'e--selected' ];

export function isClassState( state: StyleDefinitionState ): state is StyleDefinitionClassState {
	return CLASS_STATES.includes( state as StyleDefinitionClassState );
}

export function isPseudoState( state: StyleDefinitionState ): state is StyleDefinitionPseudoState {
	return PSEUDO_STATES.includes( state as StyleDefinitionPseudoState );
}

export function getAlternativeStates( state: StyleDefinitionState ): StyleDefinitionAlternativePseudoState[] {
	if ( state === 'hover' ) {
		return [ 'focus-visible' ];
	}

	return [];
}

export function getStateSelector( state: StyleDefinitionState ) {
	if ( isClassState( state ) ) {
		return `.${ state }`;
	}

	if ( isPseudoState( state ) ) {
		return `:${ state }`;
	}

	return state;
}
