import { applyWidth, loadWidth, saveWidth } from '@elementor-external/angie-sdk';

const SIDEBAR_CONTAINER_ID = 'angie-sidebar-container';
const RESIZING_CLASS = 'angie-resizing';
const RESIZE_HANDLE_WIDTH_PX = 4;
const MIN_WIDTH_PX = 350;
const MAX_WIDTH_PX = 590;
const STYLES_ID = 'e-admin-pages-angie-end-side';
const STYLES = `
@media (min-width: 768px) {
	html body.angie-sidebar-active {
		padding-inline-start: 0 !important;
		padding-inline-end: var(--angie-sidebar-width) !important;
	}

	body #angie-sidebar-container {
		inset-inline-start: auto;
		inset-inline-end: 0;
		--angie-sidebar-hide-transform: translateX(100%);
	}

	[dir="rtl"] body #angie-sidebar-container {
		--angie-sidebar-hide-transform: translateX(-100%);
	}

	body #angie-sidebar-container::after {
		inset-inline-start: 0;
		inset-inline-end: auto;
	}

	body #angie-sidebar-container.angie-resizing {
		border-inline-end-width: 0 !important;
		border-inline-start: 2px solid #ff69b4 !important;
	}

	html body.angie-sidebar-active #wpadminbar {
		inset-inline-start: 0 !important;
		inset-inline-end: var(--angie-sidebar-width) !important;
		width: auto !important;
	}

	html body.angie-sidebar-active #wpbody,
	html body.angie-sidebar-active #wpfooter,
	html body.angie-sidebar-active #editor-one-top-bar > *,
	html body.angie-sidebar-active #editor-one-secondary-bar > * {
		inset-inline-end: var(--angie-sidebar-width) !important;
		width: auto !important;
	}
}
`;

const isRTL = () => 'rtl' === document.documentElement.dir;

const clampWidth = ( width ) => Math.max( MIN_WIDTH_PX, Math.min( MAX_WIDTH_PX, width ) );

const isOnResizeHandle = ( container, clientX ) => {
	const rect = container.getBoundingClientRect();

	return isRTL()
		? clientX >= rect.right - RESIZE_HANDLE_WIDTH_PX
		: clientX <= rect.left + RESIZE_HANDLE_WIDTH_PX;
};

const setResizingCursor = ( isResizing ) => {
	document.body.style.cursor = isResizing ? 'ew-resize' : '';
	document.body.style.userSelect = isResizing ? 'none' : '';
};

export const injectEndSideStyles = () => {
	if ( document.getElementById( STYLES_ID ) ) {
		return;
	}

	const style = document.createElement( 'style' );
	style.id = STYLES_ID;
	style.textContent = STYLES;
	document.head.appendChild( style );
};

export const enableEndSideResize = () => {
	const container = document.getElementById( SIDEBAR_CONTAINER_ID );

	if ( ! container ) {
		return;
	}

	let startX = 0;
	let startWidth = 0;
	let isResizing = false;

	container.addEventListener( 'mousedown', ( event ) => {
		if ( ! isOnResizeHandle( container, event.clientX ) ) {
			return;
		}

		isResizing = true;
		startX = event.clientX;
		startWidth = container.getBoundingClientRect().width;
		container.classList.add( RESIZING_CLASS );
		setResizingCursor( true );
		event.preventDefault();
	} );

	document.addEventListener( 'mousemove', ( event ) => {
		if ( ! isResizing ) {
			return;
		}

		const delta = isRTL() ? event.clientX - startX : startX - event.clientX;

		applyWidth( clampWidth( startWidth + delta ) );
		event.preventDefault();
	} );

	document.addEventListener( 'mouseup', () => {
		if ( ! isResizing ) {
			return;
		}

		isResizing = false;
		container.classList.remove( RESIZING_CLASS );
		setResizingCursor( false );
		saveWidth( Math.round( container.getBoundingClientRect().width ) );
	} );

	applyWidth( loadWidth() );
};
