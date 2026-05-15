import * as React from 'react';
import { createContext, type PropsWithChildren, type ReactElement, useContext, useState } from 'react';
import { styled, UnstableFloatingActionBar } from '@elementor/ui';

// CSS hack to hide empty floating bars.
const FloatingBarContainer = styled( 'span' )`
	display: contents;

	.MuiFloatingActionBar-popper:has( .MuiFloatingActionBar-actions:empty ) {
		display: none;
	}

	.MuiFloatingActionBar-popper {
		z-index: 1000;
	}
`;

const FloatingActionsContext = createContext< null | {
	open: boolean;
	setOpen: React.Dispatch< React.SetStateAction< boolean > >;
} >( null );

export function FloatingActionsBar( { actions, children }: PropsWithChildren< { actions: ReactElement[] } > ) {
	const [ open, setOpen ] = useState< boolean >( false );

	return (
		<FloatingActionsContext.Provider value={ { open, setOpen } }>
			<FloatingBarContainer>
				<UnstableFloatingActionBar actions={ actions } open={ open || undefined }>
					{ children as ReactElement }
				</UnstableFloatingActionBar>
			</FloatingBarContainer>
		</FloatingActionsContext.Provider>
	);
}

export function useFloatingActionsBar() {
	const context = useContext( FloatingActionsContext );

	if ( ! context ) {
		throw new Error( 'useFloatingActions must be used within a FloatingActionsBar' );
	}

	return context;
}
