import { useEffect, useState } from 'react';

type UseScrollTopProps = {
	containerRef: React.RefObject< HTMLDivElement >;
};

export const useScrollTop = ( { containerRef }: UseScrollTopProps ) => {
	const [ scrollTop, setScrollTop ] = useState( 0 );

	useEffect( () => {
		const container = containerRef.current;

		if ( ! container ) {
			return;
		}

		const handleScroll = () => {
			setScrollTop( container.scrollTop );
		};

		container.addEventListener( 'scroll', handleScroll );
		return () => container.removeEventListener( 'scroll', handleScroll );
	}, [ containerRef ] );

	return scrollTop;
};
