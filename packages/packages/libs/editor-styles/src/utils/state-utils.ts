import {
	type StyleDefinitionAdditionalPseudoState,
	type StyleDefinitionClassState,
	type StyleDefinitionPseudoState,
	type StyleDefinitionState,
	type StyleDefinitionStateType,
} from '../types';

const PSEUDO_STATES: StyleDefinitionPseudoState[] = [ 'hover', 'focus', 'active', 'focus-visible' ];

const CLASS_STATES: StyleDefinitionClassState[] = [ 'e--selected' ];

function getAdditionalStates( state: StyleDefinitionState ): StyleDefinitionAdditionalPseudoState[] {
	if ( state === 'hover' ) {
		return [ 'focus-visible' ];
	}

	return [];
}

function getStateSelector( state: StyleDefinitionPseudoState | StyleDefinitionClassState ) {
	if ( isClassState( state ) ) {
		return `.${ state }`;
	}

	if ( isPseudoState( state ) ) {
		return `:${ state }`;
	}

	return state;
}

export function isClassState( state: StyleDefinitionStateType ): state is StyleDefinitionClassState {
	return CLASS_STATES.includes( state as StyleDefinitionClassState );
}

export function isPseudoState( state: StyleDefinitionStateType ): state is StyleDefinitionPseudoState {
	return PSEUDO_STATES.includes( state as StyleDefinitionPseudoState );
}

export function getSelectorWithState( baseSelector: string, state: StyleDefinitionState ): string {
	if ( ! state ) {
		return baseSelector;
	}

	return [ state, ...getAdditionalStates( state ) ]
		.map( ( currentState ) => `${ baseSelector }${ getStateSelector( currentState ) }` )
		.join( ',' );
}
