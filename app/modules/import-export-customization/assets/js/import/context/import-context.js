import { useReducer, useContext, createContext } from 'react';
import PropTypes from 'prop-types';

export const IMPORT_STATUS = {
	PENDING: 'PENDING',
	UPLOADING: 'UPLOADING',
	CUSTOMIZING: 'CUSTOMIZING',
	IMPORTING: 'IMPORTING',
	COMPLETED: 'COMPLETED',
};

const importReducer = ( state, { type, payload } ) => {
	switch ( type ) {
		case 'SET_IMPORT_STATUS':
			return { ...state, importStatus: payload };
		case 'SET_FILE':
			return { ...state, file: payload };
		case 'SET_UPLOADED_DATA':
			return { ...state, uploadedData: payload };
		case 'SET_IMPORTED_DATA':
			return { ...state, importedData: payload };
		case 'SET_KIT_UPLOAD_PARAMS':
			return { ...state, kitUploadParams: payload };
		case 'ADD_INCLUDE':
			return {
				...state,
				includes: state.includes.includes( payload )
					? state.includes
					: [ ...state.includes, payload ],
			};
		case 'REMOVE_INCLUDE':
			return {
				...state,
				includes: state.includes.filter( ( item ) => item !== payload ),
			};
		case 'RESET_STATE':
			return { ...initialState };
		default:
			return state;
	}
};

export const ImportContext = createContext();

const initialState = {
	file: null,
	uploadedData: null,
	importedData: null,
	kitUploadParams: null,
	plugins: [],
	includes: [ 'content', 'templates', 'settings', 'plugins' ], // All items selected by default
	importStatus: IMPORT_STATUS.PENDING,
	customization: {
		settings: null,
		templates: null,
		content: null,
		plugins: null,
	},
};
export default function ImportContextProvider( props ) {
	const [ data, dispatch ] = useReducer( importReducer, initialState );

	return (
		<ImportContext.Provider value={ {
			data,
			dispatch,
			isUploading: data.importStatus === IMPORT_STATUS.UPLOADING,
			isCustomizing: data.importStatus === IMPORT_STATUS.CUSTOMIZING,
			isProcessing: data.importStatus === IMPORT_STATUS.IMPORTING,
			isCompleted: data.importStatus === IMPORT_STATUS.COMPLETED,
		} }>
			{ props.children }
		</ImportContext.Provider>
	);
}

ImportContextProvider.propTypes = {
        children: PropTypes.node.isRequired,
};

export function useImportContext() {
	const context = useContext( ImportContext );

	if ( ! context ) {
		throw new Error( 'useImportContext must be used within an ImportContextProvider' );
	}

	return context;
}

