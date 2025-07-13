import { fontVariablePropTypeUtil } from './prop-types/font-variable-prop-type';
import { enqueueFont } from './sync/enqueue-font';
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

	const shouldUpdate = ( key: string, maybeUpdated: Variable ): boolean => {
		if ( ! ( key in variables ) ) {
			return true;
		}

		if ( variables[ key ].label !== maybeUpdated.label ) {
			return true;
		}

		if ( variables[ key ].value !== maybeUpdated.value ) {
			return true;
		}

		if ( ! variables[ key ]?.deleted && maybeUpdated?.deleted ) {
			return true;
		}

		if ( variables[ key ]?.deleted && ! maybeUpdated?.deleted ) {
			return true;
		}

		return false;
	};

	const applyUpdates = ( updatedVars: Variables ): boolean => {
		let hasChanges = false;

		for ( const [ key, variable ] of Object.entries( updatedVars ) ) {
			if ( shouldUpdate( key, variable ) ) {
				variables[ key ] = variable;

				if ( variable.type === fontVariablePropTypeUtil.key ) {
					fontEnqueue( variable.value );
				}

				hasChanges = true;
			}
		}

		return hasChanges;
	};

	const fontEnqueue = ( value: string ): void => {
		if ( ! value ) {
			return;
		}

		try {
			enqueueFont( value );
		} catch {
			// This prevents font enqueueing failures from breaking variable updates
		}
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
