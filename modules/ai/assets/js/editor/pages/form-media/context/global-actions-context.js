import PropTypes from 'prop-types';
import { createContext, useContext } from 'react';

export const GlobalActionsContext = createContext( {} );

export const GlobalActionsProvider = ( { actions, children } ) => {
	return (
		<GlobalActionsContext.Provider value={ actions }>
			{ children }
		</GlobalActionsContext.Provider>
	);
};

GlobalActionsProvider.propTypes = {
	actions: PropTypes.object,
	children: PropTypes.node,
};

export const useGlobalActions = () => {
	return useContext( GlobalActionsContext );
};
