import { createContext, PropsWithChildren, useContext } from 'react';

export interface Settings {
	urls: {
		dashboard: string,
	},
}

const SettingsContext = createContext<Settings | null>( null );

export function SettingsContextProvider( { children, settings }: PropsWithChildren<{ settings: Settings }> ) {
	return (
		<SettingsContext.Provider value={ { ...settings } }>
			{ children }
		</SettingsContext.Provider>
	);
}

export function useSettings() {
	const context = useContext( SettingsContext );

	if ( ! context ) {
		throw new Error( 'The `useSettings()` hook must be used within an `<SettingsContextProvider />`' );
	}

	return context;
}
