import { createContext, PropsWithChildren, useContext } from 'react';

type EditorSettings = {
	urls: {
		admin: string,
	},
}

const SettingsContext = createContext<Record<string, unknown> | null>( null );

export function SettingsProvider( { children, settings }: PropsWithChildren<{ settings: object }> ) {
	return (
		<SettingsContext.Provider value={ { ...settings } }>
			{ children }
		</SettingsContext.Provider>
	);
}

export function useSettings<T extends object>( key: string ): T {
	const context = useContext( SettingsContext );

	if ( ! context ) {
		throw new Error( 'The `useSettings()` hook must be used within a `<SettingsProvider />`.' );
	}

	if ( ! ( key in context ) ) {
		throw new Error( `The settings key \`${ key }\` doesn't exist.` );
	}

	// TODO: Pass a schema & use Zod?
	return context[ key ] as T;
}

export function useEditorSettings() {
	return useSettings<EditorSettings>( 'editor' );
}
