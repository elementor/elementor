import { useReducer } from 'react';

import { reducer } from './import-context-reducer';

export const Context = React.createContext();

export default function ImportContext( props ) {
	const initialState = {
		file: null,
	},
	[ data, dispatch ] = useReducer( reducer, initialState );

	return (
		<Context.Provider value={ { data, dispatch } }>
			{ props.children }
		</Context.Provider>
	);
}

ImportContext.propTypes = {
	children: PropTypes.object.isRequired,
};
