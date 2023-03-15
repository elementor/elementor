import React, { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { commandListener, removeCommandListener } from '../utils/commands';
import { useSettings } from './settings';

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

	const activateElement = ( type, source, id, name ) => {
		// TODO: Run the command instead of change the state.
		// TODO: Change route if needed.
		// RunCommand( 'controls/toggle-control', {
		// 	controlPath: `${ type }_${ source }/${ _id }/${ name }`,
		// } );

		const uid = getUid( source, id );

		setActive( ( prevState ) => ( {
			...prevState,
			element: uid,
		} ) );
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

		commandListener( 'controls/toggle-control', ( e ) => {
			const source = instance.container.source,
				id = instance.container.id,
				type = instance.container.type,
				uid = getUid( source, id );

			setActive( ( prevState ) => ( {
				...prevState,
				element: uid,
			} ) );
		} );

		if ( window.top.$e.routes.is( 'panel/global/global-colors' ) ) {
			scrollToArea( 'colors' );
		}

		if ( window.top.$e.routes.is( 'panel/global/global-typography' ) ) {
			scrollToArea( 'fonts' );
		}

		return () => {
			// TODO: ADD CLEANUP.
		};
	}, [ isReady ] );

	useEffect( () => {
		if ( ! colorsAreaRef.current || ! fontsAreaRef.current ) {
			return;
		}

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
	}, [] );

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
