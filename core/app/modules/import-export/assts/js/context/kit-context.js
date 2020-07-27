import { useReducer } from 'react';

import { reducer } from './kit-context-reducer';

export const Context = React.createContext();

export default function KitContext( props ) {
	const initialState = {
		title: 'Initial Title',
		includes: [],
		postTypes: [],
	},
	[ kitContent, dispatch ] = useReducer( reducer, initialState );

	console.log( 'kitContent', kitContent );

	return (
		<Context.Provider value={ { kitContent, dispatch } }>
			{ props.children }
		</Context.Provider>
	);
}

KitContext.propTypes = {
	children: PropTypes.object.isRequired,
};
