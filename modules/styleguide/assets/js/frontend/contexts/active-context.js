import React, { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
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

	const getUid = ( source, id ) => `${ source }-${ id }`;

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

		// Const uid = getUid( source, id );
		//
		// setActive( ( prevState ) => ( {
		// 	...prevState,
		// 	element: uid,
		// } ) );
	};

	const isActiveElement = ( source, id ) => {
		if ( getUid( source, id ) === active.element ) {
			return true;
		}

		return false;
	};

	const activateArea = ( area, { scroll = true } = {} ) => {
		if ( scroll ) {
			scrollToArea( area );
		}

		setActive( ( prevState ) => ( {
			...prevState,
			element: '',
			area,
		} ) );
	};

	const scrollToArea = ( area ) => {
		const ref = 'colors' === area ? colorsAreaRef : fontsAreaRef;

		ref.current.scrollIntoView( { behavior: 'smooth' } );
	};

	useEffect( () => {
		if ( ! isReady ) {
			return;
		}

		// window.top.$e.routes.on( 'run:after', ( component, route, args ) => {
		// 	console.log( route );
		// 	console.log( component );
		// 	console.log( args );
		// } );

		// If ( window.top.$e.routes.is( 'panel/global/global-colors' ) ) {
		// 	scrollToArea( 'colors' );
		// }
		//
		// if ( window.top.$e.routes.is( 'panel/global/global-typography' ) ) {
		// 	scrollToArea( 'fonts' );
		// }

		const observer = new IntersectionObserver( ( entries ) => {
			const intersectingArea = entries.find( ( entry ) => entry.isIntersecting );

			if ( intersectingArea ) {
				if ( colorsAreaRef.current === intersectingArea.target ) {
					activateArea( 'colors', { scroll: false } );
					return;
				}

				if ( fontsAreaRef.current === intersectingArea.target ) {
					activateArea( 'fonts', { scroll: false } );
				}
			}
		}, {} );

		observer.observe( colorsAreaRef.current );
		observer.observe( fontsAreaRef.current );

		return () => {
			// TODO: ADD CLEANUP.
		};
	}, [ isReady ] );

	// UseIntersectionObserver( ( intersectingArea ) => {
	// 	if ( colorsAreaRef.current === intersectingArea.target ) {
	// 		activateArea( 'colors', { scroll: false } );
	// 		return;
	// 	}
	//
	// 	if ( fontsAreaRef.current === intersectingArea.target ) {
	// 		activateArea( 'fonts', { scroll: false } );
	// 	}
	// }, [ colorsAreaRef.current, fontsAreaRef.current ] );

	useEffect( () => {
		console.log( 'active', active );
	}, [ active ] );

	const value = {
		activeElement: active.element,
		activeArea: active.area,
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
