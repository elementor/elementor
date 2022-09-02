import { useReducer } from 'react';

import { reducer } from './shared-context-reducer';

import kitContentData from '../../shared/kit-content-data/kit-content-data';

export const SharedContext = React.createContext();

export default function SharedContextProvider( props ) {
	const initialState = {
		includes: kitContentData.map( ( item ) => item.type ),
		referrer: null,
		customPostTypes: [],
		selectedCustomPostTypes: null,
		currentPage: null,
	},
	[ data, dispatch ] = useReducer( reducer, initialState );

	return (
		<SharedContext.Provider value={ { data, dispatch } }>
			{ props.children }
		</SharedContext.Provider>
	);
}

SharedContextProvider.propTypes = {
	children: PropTypes.object.isRequired,
};
