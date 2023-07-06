import { createContext, useContext } from 'react';

export const GlobalSettingsContext = createContext( {} );

export const GlobalSettingsProvider = ( { settings, children } ) => {
	return (
		<GlobalSettingsContext.Provider value={ settings }>
			{ children }
		</GlobalSettingsContext.Provider>
	);
};

GlobalSettingsProvider.propTypes = {
	settings: PropTypes.object,
	children: PropTypes.node,
};

export const useGlobalSettings = () => {
	return useContext( GlobalSettingsContext );
};
