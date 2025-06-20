import { type StyleVariables, type Variable } from './types';

type VariablesChangeCallback = ( variables: StyleVariables ) => void;
type Variables = Record< string, Variable >;

export const createStyleVariablesRepository = () => {
	const variables: StyleVariables = {};
	let subscription: VariablesChangeCallback;

	const subscribe = ( cb: VariablesChangeCallback ) => {
		subscription = cb;

		return () => {
			subscription = () => {};
		};
	};

	const notify = () => {
		if ( typeof subscription === 'function' ) {
			subscription( { ...variables } );
		}
	};

	const shouldUpdate = ( key: string, newValue: string ): boolean => {
		return ! ( key in variables ) || variables[ key ] !== newValue;
	};

	const applyUpdates = ( updatedVars: Variables ): boolean => {
		let hasChanges = false;

		for ( const [ key, { value } ] of Object.entries( updatedVars ) ) {
			if ( shouldUpdate( key, value ) ) {
				variables[ key ] = value;
				hasChanges = true;
			}
		}

		return hasChanges;
	};

	const update = ( updatedVars: Variables ) => {
		if ( applyUpdates( updatedVars ) ) {
			notify();
		}
	};

	return {
		subscribe,
		update,
	};
};
