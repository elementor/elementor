import StoreManager from './manager';
import { useDispatch } from 'react-redux';

export function createBasicSelectors( keys, prefix ) {
	return keys.reduce( ( current, key ) => {
		return {
			...current,
			[ key ]: ( state ) => state[ prefix ][ key ],
		};
	}, {} );
}

export function createModule( { slice, initialState, actions, selectors } ) {
	if ( ! slice ) {
		throw Error( 'slice must defined in store module.' );
	}

	const basicSelector = initialState ? createBasicSelectors( Object.keys( initialState ), slice.name ) : {};

	return {
		name: slice.name,
		slice,
		actions: {
			...slice.actions,
			...actions,
		},
		selectors: {
			...basicSelector,
			...selectors,
		},
	};
}

export function useModulesActions( name ) {
	return React.useMemo( () => StoreManager.getInstance().getModule( name ).actions, [ name ] );
}

export function useModulesSelectors( name ) {
	return React.useMemo( () => StoreManager.getInstance().getModule( name ).selectors, [ name ] );
}

export function useModulesBoundedActions( name ) {
	const dispatch = useDispatch(),
		actions = useModulesActions( name );

	return React.useMemo( () => Object.keys( actions ).reduce( ( current, key ) => {
		return {
			...current,
			[ key ]: ( payload ) => dispatch( actions[ key ]( payload ) ),
		};
	}, {} ) );
}

