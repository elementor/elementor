const MUI_PORTAL_ROOT_SELECTOR = '.MuiPopover-root, .MuiMenu-root, .MuiModal-root';

export const isClickInsideMuiPortal = ( event: MouseEvent | TouchEvent ): boolean => {
	const target = event.target;

	if ( ! ( target instanceof Element ) ) {
		return false;
	}

	return Boolean( target.closest( MUI_PORTAL_ROOT_SELECTOR ) );
};
