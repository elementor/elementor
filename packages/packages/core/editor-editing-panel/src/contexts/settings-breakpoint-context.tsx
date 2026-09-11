import * as React from 'react';
import { createContext, type PropsWithChildren, useContext } from 'react';
import { useActiveBreakpoint } from '@elementor/editor-responsive';

type ContextValue = {
	breakpoint: string;
};

const SettingsBreakpointContext = createContext< ContextValue | null >( null );

export function SettingsBreakpointProvider( { children }: PropsWithChildren ) {
	const breakpoint = useActiveBreakpoint() ?? 'desktop';

	return (
		<SettingsBreakpointContext.Provider value={ { breakpoint } }>
			{ children }
		</SettingsBreakpointContext.Provider>
	);
}

export function useSettingsBreakpoint(): string {
	return useContext( SettingsBreakpointContext )?.breakpoint ?? 'desktop';
}
