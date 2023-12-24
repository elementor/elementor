import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
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

	const { setObservedElements } = useIntersectionObserver( ( intersectingArea ) => {
		if ( colorsAreaRef.current === intersectingArea.target ) {
			activateArea( 'colors', { scroll: false } );
			return;
		}

		if ( fontsAreaRef.current === intersectingArea.target ) {
			activateArea( 'fonts', { scroll: false } );
		}
	} );

	const activateElement = ( type, source, id ) => {
		if ( 'color' === source ) {
			window.top.$e.route(
				'panel/global/global-colors',
				{ activeControl: `${ type }/${ id }/color` },
				{ history: false },
			);
		}

		if ( 'typography' === source ) {
			window.top.$e.route(
				'panel/global/global-typography',
				{ activeControl: `${ type }/${ id }/typography_typography` },
				{ history: false },
			);
		}
	};

	const getElementControl = ( type, source, id ) => {
		if ( 'color' === source ) {
			return `${ type }/${ id }/color`;
		}

		if ( 'typography' === source ) {
			return `${ type }/${ id }/typography_typography`;
		}
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

		ref.current.scrollIntoView( {
			behavior: 'smooth',
			block: 'start',
			inline: 'start',
		} );
	};

	useEffect( () => {
		if ( window.top.$e.routes.is( 'panel/global/global-colors' ) ) {
			scrollToArea( 'colors' );
		}

		if ( window.top.$e.routes.is( 'panel/global/global-typography' ) ) {
			scrollToArea( 'fonts' );
		}
	}, [] );

	useEffect( () => {
		if ( ! isReady ) {
			return;
		}

		setObservedElements( [ colorsAreaRef.current, fontsAreaRef.current ] );

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
	}, [ isReady ] );

	const value = {
		activeElement: active.element,
		activeArea: active.area,
		activateElement,
		activateArea,
		colorsAreaRef,
		fontsAreaRef,
		getElementControl,
	};

	return (
		<ActiveContext.Provider value={ value } { ...props } />
	);
};

export default ActiveProvider;

export function useActiveContext() {
	return useContext( ActiveContext );
}
