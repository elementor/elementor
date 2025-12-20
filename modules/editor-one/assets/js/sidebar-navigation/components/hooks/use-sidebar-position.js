import { useEffect } from '@wordpress/element';

const ADMIN_MENU_WRAP_ID = 'adminmenuwrap';
const SIDEBAR_CONTAINER_ID = 'editor-one-sidebar-navigation';

const getIsRTL = () => {
	return 'rtl' === document.dir || document.body.classList.contains( 'rtl' );
};

const updateSidebarPosition = () => {
	const adminMenuWrap = document.getElementById( ADMIN_MENU_WRAP_ID );
	const sidebar = document.getElementById( SIDEBAR_CONTAINER_ID );

	if ( ! adminMenuWrap || ! sidebar ) {
		return;
	}

	const isRTL = getIsRTL();
	const rect = adminMenuWrap.getBoundingClientRect();

	const offset = isRTL ? window.innerWidth - rect.left : rect.right;

	sidebar.style.insetInlineStart = `${ offset }px`;
	sidebar.style.insetInlineEnd = 'auto';
};

export const useSidebarPosition = () => {
	useEffect( () => {
		updateSidebarPosition();

		const adminMenuWrap = document.getElementById( ADMIN_MENU_WRAP_ID );
		let resizeObserver = null;

		if ( adminMenuWrap ) {
			resizeObserver = new ResizeObserver( updateSidebarPosition );
			resizeObserver.observe( adminMenuWrap );
		}

		window.addEventListener( 'resize', updateSidebarPosition );

		return () => {
			if ( resizeObserver ) {
				resizeObserver.disconnect();
			}
			window.removeEventListener( 'resize', updateSidebarPosition );
		};
	}, [] );
};

