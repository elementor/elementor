import React, { createContext, useContext, useReducer } from 'react';
import PropTypes from 'prop-types';

export const ExportContext = createContext();

const initialState = {
	downloadUrl: '',
	exportedData: null,
	isExportProcessStarted: false,
	plugins: [],
	includes: [ 'content', 'templates', 'settings', 'plugins' ], // All items selected by default
	kitInfo: {
		title: null,
		description: null,
		source: null,
	},
};

function exportReducer( state, { type, payload } ) {
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
		case 'SET_KIT_SAVE_SOURCE':
			return { ...state, kitInfo: { ...state.kitInfo, source: payload } };
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
		default:
			return state;
	}
}

export function ExportContextProvider( { children } ) {
	const [ data, dispatch ] = useReducer( exportReducer, initialState );

	const value = {
		data,
		dispatch,
		isTemplateNameValid: ( data.kitInfo.title?.trim() || '' ).length > 0,
	};

	return (
		<ExportContext.Provider value={ value }>
			{ children }
		</ExportContext.Provider>
	);
}

ExportContextProvider.propTypes = {
	children: PropTypes.node.isRequired,
};

export function useExportContext() {
	const context = useContext( ExportContext );

	if ( ! context ) {
		throw new Error( 'useExportContext must be used within an ExportContextProvider' );
	}

	return context;
}
