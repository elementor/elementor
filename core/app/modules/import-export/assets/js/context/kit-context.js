import { useReducer } from 'react';

import { reducer } from './kit-context-reducer';

export const Context = React.createContext();

export default function KitContext( props ) {
	const initialState = {
		includes: [],
		downloadURL: '',
	},
	[ kitContent, dispatch ] = useReducer( reducer, initialState );

	return (
		<Context.Provider value={ { kitContent, dispatch } }>
			{ props.children }
		</Context.Provider>
	);
}

KitContext.propTypes = {
	children: PropTypes.object.isRequired,
};
