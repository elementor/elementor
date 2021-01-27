class ReducerActions {
	static updateIncludes( state, value, action ) {
		if ( 'add' === action ) {
			// If the value already exist, then doing nothing
			if ( state.includes.includes( value ) ) {
				return state;
			}

			return { ...state, includes: [ ...state.includes, value ] };
		} else if ( 'remove' === action ) {
			return { ...state, includes: state.includes.filter( ( item ) => item !== value ) };
		}

		return state;
	}
}

export const reducer = ( state, action ) => {
	switch ( action.type ) {
		case 'SET_DOWNLOAD_URL':
			return { ...state, downloadURL: action.value };
		case 'ADD_INCLUDE':
			return ReducerActions.updateIncludes( state, action.value, 'add' );
		case 'REMOVE_INCLUDE':
			return ReducerActions.updateIncludes( state, action.value, 'remove' );
		default:
			return state;
	}
};
