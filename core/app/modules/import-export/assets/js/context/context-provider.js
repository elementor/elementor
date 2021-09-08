import { useReducer } from 'react';

import { reducer } from './context-reducer';

import kitContentData from '../shared/kit-content-data/kit-content-data';

export const Context = React.createContext();

export default function ContextProvider( props ) {
	const initialState = {
		includes: kitContentData.map( ( item ) => item.type ),
		downloadUrl: '',
		file: null,
		overrideConditions: [],
		referrer: null,
		kitInfo: {
			title: null,
			description: null,
		},
		uploadedData: null,
		importedData: null,
		exportedData: null,
	},
	[ data, dispatch ] = useReducer( reducer, initialState );

	return (
		<Context.Provider value={ { data, dispatch } }>
			{ props.children }
		</Context.Provider>
	);
}

ContextProvider.propTypes = {
	children: PropTypes.object.isRequired,
};
