import { createContext, useContext, useReducer } from 'react';
import PropTypes from 'prop-types';

export const ExportContext = createContext();

export const EXPORT_STATUS = {
	PENDING: 'PENDING',
	EXPORTING: 'EXPORTING',
	COMPLETED: 'COMPLETED',
};

const initialState = {
	downloadUrl: '',
	exportedData: null,
	exportStatus: EXPORT_STATUS.PENDING,
	plugins: [],
	customization: {
		settings: null,
		templates: null,
		content: null,
		plugins: null,
	},
	includes: [ 'content', ...( elementorAppConfig.hasPro ? [ 'templates' ] : [] ), 'settings', 'plugins' ],
	kitInfo: {
		title: null,
		description: null,
		source: null,
	},
	analytics: {
		customization: {
			settings: null,
			templates: null,
			content: null,
			plugins: null,
		},
	},
	showMediaFormatValidation: false,
	validationErrors: {
		name: null,
		description: null,
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
		case 'SET_EXPORT_STATUS':
			return { ...state, exportStatus: payload };
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
				// Clear customization when removing from includes
				customization: {
					...state.customization,
					[ payload ]: null,
				},
			};
		case 'SET_CUSTOMIZATION':
			return {
				...state,
				customization: {
					...state.customization,
					[ payload.key ]: payload.value,
				},
			};
		case 'SET_DATA_FOR_ANALYTICS':
			return {
				...state,
				analytics: {
					customization: {
						...state.analytics?.customization,
						[ payload.key ]: payload.value,
					},
				},
			};
		case 'SET_MEDIA_FORMAT_VALIDATION':
			return { ...state, showMediaFormatValidation: payload };
		case 'SET_VALIDATION_ERRORS':
			return { ...state, validationErrors: { ...state.validationErrors, ...payload } };
		case 'RESET_STATE':
			return { ...initialState };
		default:
			return state;
	}
}

export function ExportContextProvider( { children } ) {
	const [ data, dispatch ] = useReducer( exportReducer, initialState );

	const value = {
		data,
		dispatch,
		isTemplateNameValid: ( data.kitInfo.title?.trim() || '' ).length > 0 && ! data.validationErrors.name,
		hasValidationErrors: !! ( data.validationErrors.name || data.validationErrors.description ),
		isExporting: data.exportStatus === EXPORT_STATUS.EXPORTING,
		isCompleted: data.exportStatus === EXPORT_STATUS.COMPLETED,
		isPending: data.exportStatus === EXPORT_STATUS.PENDING,
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
