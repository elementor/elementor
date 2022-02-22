import { useReducer } from 'react';

import { reducer } from './export-context-reducer';

export const ExportContext = React.createContext();

export default function ExportContextProvider( props ) {
	const initialState = {
		downloadUrl: '',
		exportedData: null,
		isExportProcessStarted: false,
		plugins: [],
		kitInfo: {
			title: null,
			description: null,
		},
	},
	[ data, dispatch ] = useReducer( reducer, initialState );

	return (
		<ExportContext.Provider value={ { data, dispatch } }>
			{ props.children }
		</ExportContext.Provider>
	);
}

ExportContextProvider.propTypes = {
	children: PropTypes.object.isRequired,
};
