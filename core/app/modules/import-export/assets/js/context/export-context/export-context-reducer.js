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
		case 'SET_EXPORTED_DATA':
			return { ...state, exportedData: payload };
		case 'SET_PLUGINS':
			return { ...state, plugins: payload };
		case 'SET_IS_EXPORT_PROCESS_STARTED':
			return { ...state, isExportProcessStarted: payload };
		default:
			return state;
	}
};
