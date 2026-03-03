import * as React from 'react';
import { createContext, type ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { styled } from '@elementor/ui';

type ScrollDirection = 'up' | 'down';

type ScrollContextValue = {
	direction: ScrollDirection;
};

const ScrollContext = createContext< ScrollContextValue | undefined >( undefined );

const ScrollPanel = styled( 'div' )`
	height: 100%;
	overflow-y: auto;
`;

const DEFAULT_SCROLL_DIRECTION: ScrollDirection = 'up';

export function ScrollProvider( { children }: { children: ReactNode } ) {
	const [ direction, setDirection ] = useState< ScrollDirection >( DEFAULT_SCROLL_DIRECTION );
	const ref = useRef< HTMLDivElement >( null );
	const scrollPos = useRef< number >( 0 );

	useEffect( () => {
		const scrollElement = ref.current;

		if ( ! scrollElement ) {
			return;
		}

		const handleScroll = () => {
			const { scrollTop } = scrollElement;

			if ( scrollTop > scrollPos.current ) {
				setDirection( 'down' );
			} else if ( scrollTop < scrollPos.current ) {
				setDirection( 'up' );
			}

			scrollPos.current = scrollTop;
		};

		scrollElement.addEventListener( 'scroll', handleScroll );

		return () => {
			scrollElement.removeEventListener( 'scroll', handleScroll );
		};
	} );

	return (
		<ScrollContext.Provider value={ { direction } }>
			<ScrollPanel ref={ ref }>{ children }</ScrollPanel>
		</ScrollContext.Provider>
	);
}

export function useScrollDirection() {
	return useContext( ScrollContext )?.direction ?? DEFAULT_SCROLL_DIRECTION;
}
