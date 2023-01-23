export class ReducerUtils {
	static updateArray( state, key, value, action ) {
		if ( 'add' === action ) {
			// If the value already exists, then do nothing.
			if ( state[ key ].includes( value ) ) {
				return state;
			}

			return { ...state, [ key ]: [ ...state[ key ], value ] };
		} else if ( 'remove' === action ) {
			return { ...state, [ key ]: state[ key ].filter( ( item ) => item !== value ) };
		}

		return state;
	}
}
