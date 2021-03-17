import { useReducer } from 'react';

import { reducer } from './export-context-reducer';

export const Context = React.createContext();

export default function ExportContext( props ) {
	const initialState = {
		includes: [],
		downloadURL: '',
	},
	[ data, dispatch ] = useReducer( reducer, initialState );

	return (
		<Context.Provider value={ { data, dispatch } }>
			{ props.children }
		</Context.Provider>
	);
}

ExportContext.propTypes = {
	children: PropTypes.object.isRequired,
};
