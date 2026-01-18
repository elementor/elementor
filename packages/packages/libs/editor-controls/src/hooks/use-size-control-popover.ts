import { useCallback, useEffect } from 'react';
import { useActiveBreakpoint } from '@elementor/editor-responsive';
import { usePopupState } from '@elementor/ui';

export function useSizeControlPopover() {
	const popupState = usePopupState( { variant: 'popover' } );
	const activeBreakpoint = useActiveBreakpoint();

	const maybeClosePopup = useCallback( () => {
		if ( popupState?.isOpen ) {
			popupState.close();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps -- Using specific properties to avoid unnecessary re-renders
	}, [ popupState.isOpen, popupState.close ] );

	useEffect( () => {
		maybeClosePopup();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ activeBreakpoint ] );

	return popupState;
}
