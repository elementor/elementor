import * as React from 'react';
import { createContext, type PropsWithChildren, type RefObject, useContext, useState } from 'react';
import { Box } from '@elementor/ui';

const PopoverContentRefContext = createContext< RefObject< HTMLDivElement > | null >( null );

export const PopoverContentRefContextProvider = ( { children }: PropsWithChildren ) => {
	const [ anchorRef, setAnchorRef ] = useState< RefObject< HTMLDivElement > | null >( null );

	return (
		<PopoverContentRefContext.Provider value={ anchorRef }>
			<Box ref={ setAnchorRef }>{ children }</Box>
		</PopoverContentRefContext.Provider>
	);
};

export const usePopoverContentRef = () => {
	return useContext( PopoverContentRefContext );
};
