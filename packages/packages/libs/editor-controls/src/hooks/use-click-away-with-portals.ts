import { useRef } from 'react';

/**
 * Augments ClickAwayListener to correctly ignore clicks that originate inside
 * React portals rendered within our component subtree (e.g. MUI Select dropdowns).
 *
 * React bubbles synthetic events from portals through the declaring React tree,
 * even though DOM-wise portals live in document.body. We exploit this: an onClick
 * on our container fires for any click inside our React subtree (including portals),
 * while ClickAwayListener's document listener still fires for those clicks
 * (because DOM-containment returns false). The flag distinguishes the two.
 */
export const useClickAwayWithPortals = ( {
	isOpen,
	onClose,
}: {
	isOpen: boolean;
	onClose: () => void;
} ) => {
	const isClickInsideRef = useRef( false );

	const onContainerClick = () => {
		isClickInsideRef.current = true;
		// Reset after the current event cycle (ClickAwayListener fires synchronously
		// in the same task; setTimeout fires on the next macrotask, after the check).
		setTimeout( () => {
			isClickInsideRef.current = false;
		}, 0 );
	};

	const handleClickAway = () => {
		if ( isOpen && ! isClickInsideRef.current ) {
			onClose();
		}
	};

	return { onContainerClick, handleClickAway };
};
