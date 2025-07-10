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
		case 'SET_ID':
			return { ...state, id: payload };
		case 'SET_FILE':
			return { ...state, file: payload };
		case 'SET_KIT_SOURCE':
			return { ...state, source: payload };
		case 'SET_UPLOADED_DATA':
			return { ...state, uploadedData: payload };
		case 'SET_IMPORTED_DATA':
			return { ...state, importedData: payload };
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
		case 'SET_PLUGINS':
			return { ...state, plugins: payload };
		case 'SET_IMPORTED_PLUGINS':
			return { ...state, importedPlugins: payload };
		case 'SET_PLUGINS_STATE':
			return { ...state, pluginsState: payload };
		default:
			return state;
	}
};

export const ImportContext = createContext();

const initialState = {
	id: null,
	file: null,
	uploadedData: null,
	importedData: null,
	source: '',
	plugins: [],
	importedPlugins: [],
	pluginsState: '',
	includes: [],
	isUploading: false,
	importStatus: IMPORT_STATUS.PENDING,
};
export default function ImportContextProvider( props ) {
	const [ data, dispatch ] = useReducer( importReducer, initialState );

	return (
		<ImportContext.Provider value={ {
			data,
			dispatch,
			isUploading: data.importStatus === IMPORT_STATUS.UPLOADING,
		} }>
			{ props.children }
		</ImportContext.Provider>
	);
}

ImportContextProvider.propTypes = {
	children: PropTypes.object.isRequired,
};

export function useImportContext() {
	const context = useContext( ImportContext );

	if ( ! context ) {
		throw new Error( 'useImportContext must be used within an ImportContextProvider' );
	}

	return context;
}

