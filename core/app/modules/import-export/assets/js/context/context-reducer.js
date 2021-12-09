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
		case 'SET_DOWNLOAD_URL':
			return { ...state, downloadUrl: payload };
		case 'ADD_INCLUDE':
			return ReducerActions.updateArray( state, 'includes', payload, 'add' );
		case 'REMOVE_INCLUDE':
			return ReducerActions.updateArray( state, 'includes', payload, 'remove' );
		case 'SET_FILE':
			return { ...state, file: payload };
		case 'ADD_OVERRIDE_CONDITION':
			return ReducerActions.updateArray( state, 'overrideConditions', payload, 'add' );
		case 'REMOVE_OVERRIDE_CONDITION':
			return ReducerActions.updateArray( state, 'overrideConditions', payload, 'remove' );
		case 'SET_KIT_TITLE':
			return { ...state, kitInfo: { ...state.kitInfo, title: payload } };
		case 'SET_KIT_DESCRIPTION':
			return { ...state, kitInfo: { ...state.kitInfo, description: payload } };
		case 'SET_REFERRER':
			return { ...state, referrer: payload };
		case 'SET_INCLUDES':
			return { ...state, includes: payload };
		case 'SET_UPLOADED_DATA':
			return { ...state, uploadedData: payload };
		case 'SET_IMPORTED_DATA':
			return { ...state, importedData: payload };
		case 'SET_EXPORTED_DATA':
			return { ...state, exportedData: payload };
		case 'SET_PLUGINS':
			return { ...state, plugins: payload };
		case 'SET_REQUIRED_PLUGINS':
			return { ...state, requiredPlugins: payload };
		case 'SET_FAILED_PLUGINS':
			return { ...state, failedPlugins: payload };
		default:
			return state;
	}
};
