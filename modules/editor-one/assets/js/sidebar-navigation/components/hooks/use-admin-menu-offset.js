import { useEffect, useRef } from '@wordpress/element';
import isRTL from '../../../shared/is-rtl';

const ADMIN_MENU_WRAP_ID = 'adminmenuwrap';
const WPCONTENT_ID = 'wpcontent';
const EDITOR_ONE_TOP_BAR_ID = 'editor-one-top-bar';
const WPADMINBAR_ID = 'wpadminbar';
const INITIALIZED_DATA_ATTR = 'data-editor-one-offset-initialized';
const WPFOOTER_ID = 'wpfooter';
const WPBODY_CONTENT_ID = 'wpbody-content';

export const useAdminMenuOffset = () => {
	const cleanupRef = useRef( null );

	useEffect( () => {
		const adminMenuWrap = document.getElementById( ADMIN_MENU_WRAP_ID );
		const wpcontent = document.getElementById( WPCONTENT_ID );

		if ( ! adminMenuWrap || ! wpcontent || wpcontent.hasAttribute( INITIALIZED_DATA_ATTR ) ) {
			return;
		}

		const wpfooter = document.getElementById( WPFOOTER_ID );
		const wpbodyContent = document.getElementById( WPBODY_CONTENT_ID );
		wpbodyContent?.insertBefore( wpfooter, wpbodyContent.querySelector( ':scope > .clear' ) );

		const wpAdminBar = document.getElementById( WPADMINBAR_ID );

		const updateOffset = () => {
			const topBarHeader = document.getElementById( EDITOR_ONE_TOP_BAR_ID )?.querySelector( ':scope > header' );
			const isRtlLanguage = isRTL();
			const rect = adminMenuWrap.getBoundingClientRect();

			const offset = isRtlLanguage ? document.documentElement.clientWidth - rect.left : rect.right;
			const adminBarHeightPx = `${ wpAdminBar?.clientHeight ?? 0 }px`;
			const topBarHeaderHeightPx = `${ topBarHeader?.clientHeight ?? 0 }px`;

			wpcontent.style.setProperty( '--editor-one-sidebar-left-offset', `${ offset }px` );
			wpcontent.style.setProperty( '--e-admin-bar-height', adminBarHeightPx );
			wpcontent.style.setProperty( '--e-top-bar-header-height', topBarHeaderHeightPx );
		};

		updateOffset();

		const resizeObserver = new ResizeObserver( updateOffset );

		resizeObserver.observe( wpcontent );

		const topBar = document.getElementById( EDITOR_ONE_TOP_BAR_ID );
		if ( topBar ) {
			resizeObserver.observe( topBar );
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
