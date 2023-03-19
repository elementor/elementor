import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { commandListener, removeCommandListener } from '../utils/commands';
import { useSettings } from './settings';
import useIntersectionObserver from '../hooks/use-intersection-observer';

export const ActiveContext = createContext( null );

const ActiveProvider = ( props ) => {
	const [ active, setActive ] = useState( {
		element: '',
		area: '',
	} );

	const colorsAreaRef = useRef( null );
	const fontsAreaRef = useRef( null );

	const { isReady } = useSettings();

	// Const { observe, unobserve, setObservedElements } = useIntersectionObserver( ( intersectingArea ) => {
	// 	if ( colorsAreaRef.current === intersectingArea.target ) {
	// 		activateArea( 'colors', { scroll: false } );
	// 		return;
	// 	}
	//
	// 	if ( fontsAreaRef.current === intersectingArea.target ) {
	// 		activateArea( 'fonts', { scroll: false } );
	// 	}
	// } );

	const activateElement = ( type, source, id ) => {
		if ( 'color' === source ) {
			window.top.$e.route(
				'panel/global/global-colors',
				{ activeControl: `${ type }/${ id }/color` },
				{ history: false }
			);
		}

		if ( 'typography' === source ) {
			window.top.$e.route(
				'panel/global/global-typography',
				{ activeControl: `${ type }/${ id }/typography_typography` },
				{ history: false }
			);
		}
	};

	const isActiveElement = ( type, source, id ) => {
		if ( 'color' === source ) {
			if ( `${ type }/${ id }/color` === active.element ) {
				return true;
			}
		}

		if ( 'typography' === source ) {
			if ( `${ type }/${ id }/typography_typography` === active.element ) {
				return true;
			}
		}

		return false;
	};

	const activateArea = ( area, { scroll = true } = {} ) => {
		if ( scroll ) {
			scrollToArea( area );
		}

		setActive( ( prevState ) => ( {
			...prevState,
			area,
		} ) );
	};

	const scrollToArea = ( area ) => {
		const ref = 'colors' === area ? colorsAreaRef : fontsAreaRef;

		ref.current.scrollIntoView( { behavior: 'smooth' } );
	};

	const scrollToElement = async ( element ) => {
		// Unobserve();
		await element.scrollIntoView( {
			behavior: 'smooth',
			block: 'center',
			inline: 'center',
		} );
		// Observe();
	};

	useEffect( () => {
		if ( ! isReady ) {
			return;
		}

		// SetObservedElements( [ colorsAreaRef.current, fontsAreaRef.current ] );
		// observe();

		window.top.$e.routes.on( 'run:after', ( component, route, args ) => {
			if ( 'panel/global/global-typography' === route ) {
				setActive( () => ( {
					area: 'fonts',
					element: args.activeControl,
				} ) );
			}

			if ( 'panel/global/global-colors' === route ) {
				setActive( () => ( {
					area: 'colors',
					element: args.activeControl,
				} ) );
			}
		} );

		// If ( window.top.$e.routes.is( 'panel/global/global-colors' ) ) {
		// 	scrollToArea( 'colors' );
		// }
		//
		// if ( window.top.$e.routes.is( 'panel/global/global-typography' ) ) {
		// 	scrollToArea( 'fonts' );
		// }

		return () => {
			// Unobserve();
		};
	}, [ isReady ] );

	useEffect( () => {
		console.log( 'active', active );
	}, [ active ] );

	const value = {
		activeElement: active.element,
		activeArea: active.area,
		scrollToElement,
		isActiveElement,
		activateElement,
		activateArea,
		colorsAreaRef,
		fontsAreaRef,
	};

	return (
		<ActiveContext.Provider value={ value } { ...props } />
	);
};

export default ActiveProvider;

export function useActive() {
	return useContext( ActiveContext );
}
