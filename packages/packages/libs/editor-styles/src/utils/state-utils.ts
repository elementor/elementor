import { type StyleDefinitionCustomState, type StyleDefinitionNativeState, type StyleDefinitionState } from '../types';

const NATIVE_STATES: StyleDefinitionNativeState[] = [ 'hover', 'focus', 'active' ];

const CUSTOM_STATES: StyleDefinitionCustomState[] = [ 'e--selected' ];

export function isCustomState( state: StyleDefinitionState ): state is StyleDefinitionCustomState {
	return CUSTOM_STATES.includes( state as StyleDefinitionCustomState );
}

export function isNativeState( state: StyleDefinitionState ): state is StyleDefinitionNativeState {
	return NATIVE_STATES.includes( state as StyleDefinitionNativeState );
}
