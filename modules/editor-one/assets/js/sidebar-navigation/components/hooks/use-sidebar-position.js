import { useEffect } from '@wordpress/element';

const ADMIN_MENU_WRAP_ID = 'adminmenuwrap';
const SIDEBAR_CONTAINER_ID = 'editor-one-sidebar-navigation';
const TRANSITION_DELAY = 350;

const getIsRTL = () => {
	return 'rtl' === document.dir || document.body.classList.contains( 'rtl' );
};

export const useSidebarPosition = () => {
	useEffect( () => {
		const adminMenuWrap = document.getElementById( ADMIN_MENU_WRAP_ID );
		const sidebar = document.getElementById( SIDEBAR_CONTAINER_ID );

		if ( ! adminMenuWrap || ! sidebar ) {
			return;
		}

		const updateSidebarPosition = () => {
			const isRTL = getIsRTL();
			const rect = adminMenuWrap.getBoundingClientRect();

			const offset = isRTL ? window.innerWidth - rect.left : rect.right;

			sidebar.style.insetInlineStart = `${ offset }px`;
			sidebar.style.insetInlineEnd = 'auto';
		};

		updateSidebarPosition();

		const resizeObserver = new ResizeObserver( updateSidebarPosition );
		resizeObserver.observe( adminMenuWrap );

		const mutationObserver = new MutationObserver( () => {
			updateSidebarPosition();
			setTimeout( updateSidebarPosition, TRANSITION_DELAY );
		} );

		mutationObserver.observe( document.body, {
			attributes: true,
			attributeFilter: [ 'class' ],
		} );

		mutationObserver.observe( document.documentElement, {
			attributes: true,
			attributeFilter: [ 'class' ],
		} );

		window.addEventListener( 'resize', updateSidebarPosition );

		return () => {
			resizeObserver.disconnect();
			mutationObserver.disconnect();
			window.removeEventListener( 'resize', updateSidebarPosition );
		};
	}, [] );
};
