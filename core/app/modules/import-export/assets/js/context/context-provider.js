import { useReducer } from 'react';

import { reducer } from './context-reducer';

export const Context = React.createContext();

export default function ContextProvider( props ) {
	const initialState = {
		includes: [],
		downloadUrl: '',
		fileResponse: null,
		file: null,
		overrideConditions: [],
		kitInfo: {
			title: elementorAppConfig[ 'import-export' ].kitInfo.title,
			description: elementorAppConfig[ 'import-export' ].kitInfo.description,
		},
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
