class ReducerActions {
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

export const reducer = ( state, { type, payload } ) => {
	switch ( type ) {
		case 'ADD_INCLUDE':
			return ReducerActions.updateArray( state, 'includes', payload, 'add' );
		case 'REMOVE_INCLUDE':
			return ReducerActions.updateArray( state, 'includes', payload, 'remove' );
		case 'SET_FILE':
			return { ...state, file: payload };
		case 'SET_KIT_TITLE':
			return { ...state, kitInfo: { ...state.kitInfo, title: payload } };
		case 'SET_KIT_DESCRIPTION':
			return { ...state, kitInfo: { ...state.kitInfo, description: payload } };
		case 'SET_REFERRER':
			return { ...state, referrer: payload };
		case 'SET_INCLUDES':
			return { ...state, includes: payload };
		default:
			return state;
	}
};
