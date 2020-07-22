import { useReducer } from 'react';

export const Context = React.createContext();

const reducer = ( state, action ) => {
	console.log( 'start of reducer' );
	switch ( action.type ) {
		case 'SET_TITLE':
			return { ...state, title: action.value };
		case 'ADD_INCLUDE':
			console.log( '### end of: ADD_INCLUDE' );
			return { ...state, includes: [ ...state.includes, action.value ] };
		case 'REMOVE_INCLUDE':
			console.log( '### end of: REMOVE_INCLUDE' );
			return { ...state, includes: state.includes.filter( ( item ) => item !== action.value ) };
			case 'SET_POST_TYPES':
				console.log( '### end of: SET_POST_TYPES' );
			return { ...state, postTypes: action.value };
		default:
			return state;
	}
};

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
