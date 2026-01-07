import { useEffect } from '@wordpress/element';

const ADMIN_MENU_WRAP_ID = 'adminmenuwrap';
const SIDEBAR_CONTAINER_ID = 'editor-one-sidebar-navigation';
const MAX_RETRY_ATTEMPTS = 20;
const RETRY_DELAY_MS = 100;
const MAX_WAIT_TIME_MS = MAX_RETRY_ATTEMPTS * RETRY_DELAY_MS;

const getIsRTL = () => {
	return 'rtl' === document.dir || document.body.classList.contains( 'rtl' );
};

const initializePositioning = ( adminMenuWrap, sidebar ) => {
	const updateSidebarPosition = () => {
		if ( ! adminMenuWrap || ! sidebar ) {
			return;
		}

		const isRTL = getIsRTL();
		const rect = adminMenuWrap.getBoundingClientRect();

		const offset = isRTL ? window.innerWidth - rect.left : rect.right;

		sidebar.style.insetInlineStart = `${ offset }px`;
		sidebar.style.insetInlineEnd = 'auto';
	};

	updateSidebarPosition();

	const resizeObserver = new ResizeObserver( updateSidebarPosition );

	resizeObserver.observe( adminMenuWrap );
	window.addEventListener( 'resize', updateSidebarPosition );

	return () => {
		resizeObserver.disconnect();
		window.removeEventListener( 'resize', updateSidebarPosition );
	};
};

export const useSidebarPosition = () => {
	useEffect( () => {
		let cleanup = null;
		let mutationObserver = null;
		let retryTimeout = null;
		let retryAttempts = 0;
		let isCleanedUp = false;

		const tryInitialize = () => {
			const adminMenuWrap = document.getElementById( ADMIN_MENU_WRAP_ID );
			const sidebar = document.getElementById( SIDEBAR_CONTAINER_ID );

			if ( adminMenuWrap && sidebar ) {
				cleanup = initializePositioning( adminMenuWrap, sidebar );

				if ( mutationObserver ) {
					mutationObserver.disconnect();
					mutationObserver = null;
				}

				if ( retryTimeout ) {
					clearTimeout( retryTimeout );
					retryTimeout = null;
				}

				return true;
			}

			return false;
		};

		if ( tryInitialize() ) {
			return () => {
				if ( cleanup ) {
					cleanup();
				}
			};
		}

		mutationObserver = new MutationObserver( () => {
			if ( ! isCleanedUp && tryInitialize() ) {
				mutationObserver.disconnect();
				mutationObserver = null;
			}
		} );

		mutationObserver.observe( document.body, {
			childList: true,
			subtree: true,
		} );

		const retryWithTimeout = () => {
			if ( isCleanedUp || retryAttempts >= MAX_RETRY_ATTEMPTS ) {
				return;
			}

			retryAttempts++;

			if ( tryInitialize() ) {
				return;
			}

			retryTimeout = setTimeout( retryWithTimeout, RETRY_DELAY_MS );
		};

		retryTimeout = setTimeout( retryWithTimeout, RETRY_DELAY_MS );

		setTimeout( () => {
			if ( mutationObserver && ! isCleanedUp ) {
				mutationObserver.disconnect();
				mutationObserver = null;
			}
		}, MAX_WAIT_TIME_MS );

		return () => {
			isCleanedUp = true;

			if ( cleanup ) {
				cleanup();
			}

			if ( mutationObserver ) {
				mutationObserver.disconnect();
			}

			if ( retryTimeout ) {
				clearTimeout( retryTimeout );
			}
		};
	}, [] );
};
