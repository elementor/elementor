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
		case 'SET_KIT_TITLE':
			return { ...state, kitInfo: { ...state.kitInfo, title: payload } };
		case 'SET_KIT_DESCRIPTION':
			return { ...state, kitInfo: { ...state.kitInfo, description: payload } };
		default:
			return state;
	}
};
