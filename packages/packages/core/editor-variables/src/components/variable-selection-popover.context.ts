import { createContext, useContext } from 'react';

export const PopoverContentRefContext = createContext< React.RefObject< HTMLDivElement > | null >( null );

export const usePopoverContentRef = () => {
	return useContext( PopoverContentRefContext );
};
