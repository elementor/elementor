import { useEffect, useRef } from '@wordpress/element';

const ADMIN_MENU_WRAP_ID = 'adminmenuwrap';
const WPCONTENT_ID = 'wpcontent';
const INITIALIZED_DATA_ATTR = 'data-editor-one-offset-initialized';

const getIsRTL = () => {
	return 'rtl' === document.dir || document.body.classList.contains( 'rtl' );
};

export const useAdminMenuOffset = () => {
	const cleanupRef = useRef( null );

	useEffect( () => {
		const adminMenuWrap = document.getElementById( ADMIN_MENU_WRAP_ID );
		const wpcontent = document.getElementById( WPCONTENT_ID );

		if ( ! adminMenuWrap || ! wpcontent || wpcontent.hasAttribute( INITIALIZED_DATA_ATTR ) ) {
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

		wpcontent.setAttribute( INITIALIZED_DATA_ATTR, 'true' );

		cleanupRef.current = () => {
			resizeObserver.disconnect();
			window.removeEventListener( 'resize', updateOffset );
			wpcontent.removeAttribute( INITIALIZED_DATA_ATTR );
		};

		return () => {
			if ( cleanupRef.current ) {
				cleanupRef.current();
				cleanupRef.current = null;
			}
		};
	}, [] );
};
