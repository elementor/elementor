import { type Rule } from '@commitlint/types';

export const requireScope = ( (
	{ scope, type },
	_,
	value: undefined | { scopes?: string[]; types?: string[]; allowEmpty?: boolean }
) => {
	const { scopes, types = [], allowEmpty = true } = value ?? {};

	if ( ! type ) {
		return [ true ];
	}

	if ( ! scopes?.length ) {
		return [ false, 'Your configuration must contain a list of scopes' ];
	}

	if ( ! types?.length ) {
		return [ false, 'Your configuration must contain a list of types' ];
	}

	if ( ! types.includes( type ) ) {
		return [ true ];
	}

	if ( allowEmpty && ! scope ) {
		return [ true ];
	}

	if ( ! scope || ! scopes.includes( scope ) ) {
		return [ false, `Your commit should contain one of the following scopes: \n\t${ scopes.join( '\n\t' ) }` ];
	}

	return [ true ];
} ) satisfies Rule;
