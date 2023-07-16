import { createContext, useReducer, useContext, useEffect } from 'react';

export const RoutesContext = createContext( null );

export const NAVIGATE = 'NAVIGATE';
export const BACK = 'BACK';

const initialValue = {
	current: '',
	history: [],
};

const reducer = ( state, { type, payload } ) => {
	switch ( type ) {
		case NAVIGATE:
			return {
				...state,
				current: payload,
				history: [ ...state.history, payload ],
			};
		case BACK:
			return {
				...state,
				current: state.history[ state.history.length - 2 ],
				history: state.history.slice( 0, state.history.length - 1 ),
			};
		default:
			return state;
	}
};

export const LocationProvider = ( { children } ) => {
	const [ state, dispatch ] = useReducer( reducer, initialValue );

	return (
		<RoutesContext.Provider value={ { state, dispatch } }>
			{ children }
		</RoutesContext.Provider>
	);
};

LocationProvider.propTypes = {
	children: PropTypes.node,
};

export const useLocation = ( { current } = {} ) => {
	const { state, dispatch } = useContext( RoutesContext );

	const navigate = ( location ) => {
		dispatch( { type: NAVIGATE, payload: location } );
	};

	const back = () => {
		dispatch( { type: BACK } );
	};

	useEffect( () => {
		if ( current ) {
			navigate( current );
		}
	}, [] );

	return {
		current: state.current,
		history: state.history,
		navigate,
		back,
	};
};
