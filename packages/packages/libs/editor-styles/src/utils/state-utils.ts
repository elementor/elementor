import { type StyleDefinitionClassState, type StyleDefinitionPseudoState, type StyleDefinitionState } from '../types';

const PSEUDO_STATES: StyleDefinitionPseudoState[] = [ 'hover', 'focus', 'active' ];

const CLASS_STATES: StyleDefinitionClassState[] = [ 'e--selected' ];

export function isClassState( state: StyleDefinitionState ): state is StyleDefinitionClassState {
	return CLASS_STATES.includes( state as StyleDefinitionClassState );
}

export function isPseudoState( state: StyleDefinitionState ): state is StyleDefinitionPseudoState {
	return PSEUDO_STATES.includes( state as StyleDefinitionPseudoState );
}

export function getStateSelector( { label, state }: { label: string; state: StyleDefinitionState } ) {
	if ( isClassState( state ) ) {
		return `${ label }.${ state }`;
	}

	if ( isPseudoState( state ) ) {
		if ( state === 'hover' ) {
			return `${ label }:hover, ${ label }:focus-visible`;
		}

		return `${ label }:${ state }`;
	}

	return label;
}