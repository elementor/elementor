import { createContext, PropsWithChildren, useContext } from 'react';

export type EnvOptions = {
	urls: {
		dashboard: string,
	},
}

const EnvContext = createContext<EnvOptions | null>( null );

export function EnvContextProvider( { children, ...options }: PropsWithChildren<EnvOptions> ) {
	// TODO: Validate options?

	return (
		<EnvContext.Provider value={ { ...options } }>
			{ children }
		</EnvContext.Provider>
	);
}

export function useEnvOptions() {
	const context = useContext( EnvContext );

	if ( ! context ) {
		throw new Error( 'The `useEnvOptions()` hook must be used within an `<EnvContextProvider />`' );
	}

	return context;
}
