import { useEffect } from '@wordpress/element';

const ADMIN_MENU_WRAP_ID = 'adminmenuwrap';
const WPCONTENT_ID = 'wpcontent';

let isInitialized = false;

const getIsRTL = () => {
	return 'rtl' === document.dir || document.body.classList.contains( 'rtl' );
};

export const useAdminMenuOffset = () => {
	useEffect( () => {
		if ( isInitialized ) {
			return;
		}

		const adminMenuWrap = document.getElementById( ADMIN_MENU_WRAP_ID );

		if ( ! adminMenuWrap ) {
			return;
		}

		const wpcontent = document.getElementById( WPCONTENT_ID );

		if ( ! wpcontent ) {
			return;
		}

		const updateOffset = () => {
			const isRTL = getIsRTL();
			const rect = adminMenuWrap.getBoundingClientRect();

			const offset = isRTL ? window.innerWidth - rect.left : rect.right;

			wpcontent.style.setProperty( '--editor-one-sidebar-left-offset', `${ offset }px` );
		};

		updateOffset();

		const resizeObserver = new ResizeObserver( updateOffset );

		resizeObserver.observe( wpcontent );
		window.addEventListener( 'resize', updateOffset );

		isInitialized = true;
	}, [] );
};
