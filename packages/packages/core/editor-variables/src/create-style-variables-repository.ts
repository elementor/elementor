import { fontVariablePropTypeUtil } from './prop-types/font-variable-prop-type';
import { enqueueFont } from './sync/enqueue-font';
import { type Variable, type VariablesList } from './types';
import { transformValue } from './utils/transform-value';

type VariablesChangeCallback = ( variables: VariablesList ) => void;

export const createStyleVariablesRepository = () => {
	const variables: VariablesList = {};
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

	const applyUpdates = ( updatedVars: VariablesList ): boolean => {
		let hasChanges = false;

		for ( const [ key, variable ] of Object.entries( updatedVars ) ) {
			if ( shouldUpdate( key, variable ) ) {
				variables[ key ] = variable;

				if ( variable.type === fontVariablePropTypeUtil.key ) {
					fontEnqueue( transformValue( variable ) );
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

	const update = ( updatedVars: VariablesList ) => {
		if ( applyUpdates( updatedVars ) ) {
			notify();
		}
	};

	return {
		subscribe,
		update,
	};
};
