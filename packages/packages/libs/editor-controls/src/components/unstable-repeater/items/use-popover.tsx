import { useEffect, useState } from 'react';
import { bindPopover, type PopoverProps,usePopupState } from '@elementor/ui';

export const usePopover = ( openOnMount: boolean, onOpen: () => void ) => {
	const [ ref, setRef ] = useState< HTMLElement | null >( null );

	const popoverState = usePopupState( { variant: 'popover' } );

	const popoverProps: Partial< PopoverProps > = bindPopover( popoverState );

	useEffect( () => {
		if ( openOnMount && ref ) {
			popoverState.open( ref );
			onOpen?.();
		}
		// eslint-disable-next-line react-compiler/react-compiler
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ ref ] );

	return {
		popoverState,
		ref,
		setRef,
		popoverProps,
	};
};
