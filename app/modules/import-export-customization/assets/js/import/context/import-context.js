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
		case 'SET_RUNNERS_STATE':
			return {
				...state,
				runnersState: {
					...state.runnersState,
					...payload,
				},
			};
		case 'ADD_INCLUDE':
			return {
				...state,
				includes: state.includes.includes( payload )
					? state.includes
					: [ ...state.includes, payload ],
			};
		case 'ADD_INCLUDES':
			return {
				...state,
				includes: Array.from( new Set( [ ...state.includes, ...payload ] ) ),
			};
		case 'REMOVE_INCLUDE':
			return {
				...state,
				includes: state.includes.filter( ( item ) => item !== payload ),
				// Clear customization when removing from includes
				customization: {
					...state.customization,
					[ payload ]: null,
				},
			};
		case 'RESET_STATE':
			return { ...initialState };
		case 'SET_CUSTOMIZATION':
			return {
				...state,
				customization: {
					...state.customization,
					[ payload.key ]: payload.value,
				},
			};
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
	includes: [ 'plugins' ],
	importStatus: IMPORT_STATUS.PENDING,
	runnersState: {},
	customization: {
		settings: null,
		templates: null,
		content: null,
		plugins: null,
	},
};
export default function ImportContextProvider( props ) {
	const [ data, dispatch ] = useReducer( importReducer, initialState );

	const isOldExport = data.uploadedData?.manifest?.version < elementorAppConfig[ 'import-export-customization' ].manifestVersion;

	return (
		<ImportContext.Provider value={ {
			data,
			dispatch,
			runnersState: data.runnersState,
			isUploading: data.importStatus === IMPORT_STATUS.UPLOADING,
			isCustomizing: data.importStatus === IMPORT_STATUS.CUSTOMIZING,
			isProcessing: data.importStatus === IMPORT_STATUS.IMPORTING,
			isCompleted: data.importStatus === IMPORT_STATUS.COMPLETED,
			isOldExport,
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

