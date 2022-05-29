import { useReducer } from 'react';

import { reducer } from './import-context-reducer';

export const ImportContext = React.createContext();

export default function ImportContextProvider( props ) {
	const initialState = {
		file: null,
		uploadedData: null,
		importedData: null,
		plugins: [],
		requiredPlugins: [],
		importedPlugins: [],
		overrideConditions: [],
		isProInstalledDuringProcess: false,
		actionType: null,
		isResolvedData: false,
		pluginsState: '',
	},
	[ data, dispatch ] = useReducer( reducer, initialState );

	return (
		<ImportContext.Provider value={ { data, dispatch } }>
			{ props.children }
		</ImportContext.Provider>
	);
}

ImportContextProvider.propTypes = {
	children: PropTypes.object.isRequired,
};
