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
		case 'SET_FILE':
			return { ...state, file: payload };
		case 'ADD_OVERRIDE_CONDITION':
			return ReducerActions.updateArray( state, 'overrideConditions', payload, 'add' );
		case 'REMOVE_OVERRIDE_CONDITION':
			return ReducerActions.updateArray( state, 'overrideConditions', payload, 'remove' );
		case 'SET_UPLOADED_DATA':
			return { ...state, uploadedData: payload };
		case 'SET_IMPORTED_DATA':
			return { ...state, importedData: payload };
		case 'SET_PLUGINS':
			return { ...state, plugins: payload };
		case 'SET_REQUIRED_PLUGINS':
			return { ...state, requiredPlugins: payload };
		case 'SET_IMPORTED_PLUGINS':
			return { ...state, importedPlugins: payload };
		case 'SET_IS_PRO_INSTALLED_DURING_PROCESS':
			return { ...state, isProInstalledDuringProcess: payload };
		default:
			return state;
	}
};
