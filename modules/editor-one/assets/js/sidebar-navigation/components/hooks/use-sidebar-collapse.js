import { useEffect, useState, useCallback, useRef } from '@wordpress/element';

const STORAGE_KEY = 'elementor_sidebar_collapsed';
const AUTO_COLLAPSE_BREAKPOINT = 960;
const TRANSITION_DURATION = 300;

export const useSidebarCollapse = () => {
	const isAnimatingRef = useRef( false );

	const [ isCollapsed, setIsCollapsed ] = useState( () => {
		const stored = localStorage.getItem( STORAGE_KEY );

		if ( null !== stored ) {
			return 'true' === stored;
		}

		return window.innerWidth <= AUTO_COLLAPSE_BREAKPOINT;
	} );

	useEffect( () => {
		const mediaQuery = window.matchMedia( `(max-width: ${ AUTO_COLLAPSE_BREAKPOINT }px)` );

		const handleResize = ( e ) => {
			if ( e.matches ) {
				setIsCollapsed( true );
			} else {
				const stored = localStorage.getItem( STORAGE_KEY );
				setIsCollapsed( 'true' === stored );
			}
		};

		mediaQuery.addEventListener( 'change', handleResize );
		return () => mediaQuery.removeEventListener( 'change', handleResize );
	}, [] );

	const toggleCollapse = useCallback( () => {
		const newState = ! isCollapsed;
		const container = document.getElementById( 'editor-one-sidebar-navigation' );
		const body = document.body;

		isAnimatingRef.current = true;
		body.classList.add( 'e-sidebar-transitioning' );

		void container?.offsetHeight;

		if ( newState ) {
			container?.classList.add( 'e-sidebar-collapsed' );
			body.classList.add( 'e-sidebar-is-collapsed' );
		} else {
			container?.classList.remove( 'e-sidebar-collapsed' );
			body.classList.remove( 'e-sidebar-is-collapsed' );
		}

		setIsCollapsed( newState );
		localStorage.setItem( STORAGE_KEY, String( newState ) );

		setTimeout( () => {
			body.classList.remove( 'e-sidebar-transitioning' );
			isAnimatingRef.current = false;
		}, TRANSITION_DURATION );
	}, [ isCollapsed ] );

	useEffect( () => {
		if ( isAnimatingRef.current ) {
			return;
		}

		const container = document.getElementById( 'editor-one-sidebar-navigation' );
		const body = document.body;

		if ( isCollapsed ) {
			container?.classList.add( 'e-sidebar-collapsed' );
			body.classList.add( 'e-sidebar-is-collapsed' );
		} else {
			container?.classList.remove( 'e-sidebar-collapsed' );
			body.classList.remove( 'e-sidebar-is-collapsed' );
		}
	}, [ isCollapsed ] );

	return { isCollapsed, toggleCollapse };
};
