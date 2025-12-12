import { useEffect, useState, useCallback } from '@wordpress/element';

const STORAGE_KEY = 'elementor_sidebar_collapsed';
const AUTO_COLLAPSE_BREAKPOINT = 960;

export const useSidebarCollapse = () => {
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
				// Restore from storage or default to false (expanded)
				const stored = localStorage.getItem( STORAGE_KEY );
				setIsCollapsed( 'true' === stored );
			}
		};

		mediaQuery.addEventListener( 'change', handleResize );
		return () => mediaQuery.removeEventListener( 'change', handleResize );
	}, [] );

	const toggleCollapse = useCallback( () => {
		const newState = ! isCollapsed;
		setIsCollapsed( newState );
		localStorage.setItem( STORAGE_KEY, String( newState ) );

		const body = document.body;
		body.classList.add( 'e-sidebar-transitioning' );
		// Match CSS transition duration (0.3s)
		setTimeout( () => {
			body.classList.remove( 'e-sidebar-transitioning' );
		}, 300 );
	}, [ isCollapsed ] );

	useEffect( () => {
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
