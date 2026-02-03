import { useEffect, useRef } from '@wordpress/element';

const ADMIN_MENU_WRAP_ID = 'adminmenuwrap';
const WPCONTENT_ID = 'wpcontent';
const EDITOR_ONE_TOP_BAR_ID = 'editor-one-top-bar';
const WPADMINBAR_ID = 'wpadminbar';
const INITIALIZED_DATA_ATTR = 'data-editor-one-offset-initialized';
const WPFOOTER_ID = 'wpfooter';
const WPBODY_CONTENT_ID = 'wpbody-content';

const getIsRTL = () => {
	return 'rtl' === document.dir || document.body.classList.contains( 'rtl' );
};

export const useAdminMenuOffset = () => {
	const cleanupRef = useRef( null );

	useEffect( () => {
		const adminMenuWrap = document.getElementById( ADMIN_MENU_WRAP_ID );
		const wpcontent = document.getElementById( WPCONTENT_ID );
		const wpfooter = document.getElementById( WPFOOTER_ID );

		if ( ! adminMenuWrap || ! wpcontent || wpcontent.hasAttribute( INITIALIZED_DATA_ATTR ) ) {
			return;
		}

		const wpbodyContent = document.getElementById( WPBODY_CONTENT_ID );
		wpbodyContent?.insertBefore( wpfooter, wpbodyContent.querySelector( ':scope > .clear' ) );

		const updateOffset = () => {
			const isRTL = getIsRTL();
			const rect = adminMenuWrap.getBoundingClientRect();

			const offset = isRTL ? window.innerWidth - rect.left : rect.right;

			wpcontent.style.setProperty( '--editor-one-sidebar-left-offset', `${ offset }px` );

			const wpadminbar = document.getElementById( WPADMINBAR_ID );
			const topBarHeader = document.getElementById( EDITOR_ONE_TOP_BAR_ID )?.querySelector( ':scope > header' );
			const adminBarHeightPx = wpadminbar ? `${ wpadminbar.clientHeight }px` : '0px';
			const topBarHeaderHeightPx = topBarHeader ? `${ topBarHeader.clientHeight }px` : '0px';

			wpcontent.style.setProperty( '--e-admin-bar-height', adminBarHeightPx );
			wpcontent.style.setProperty( '--e-top-bar-header-height', topBarHeaderHeightPx );
		};

		updateOffset();

		const resizeObserver = new ResizeObserver( updateOffset );

		resizeObserver.observe( wpcontent );
		const topBarForObserve = document.getElementById( EDITOR_ONE_TOP_BAR_ID );
		if ( topBarForObserve ) {
			resizeObserver.observe( topBarForObserve );
		}
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
