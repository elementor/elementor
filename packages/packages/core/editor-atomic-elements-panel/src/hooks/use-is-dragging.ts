import { useEffect, useState } from 'react';

type Channel = {
	on: ( event: string, callback: () => void ) => void;
	off: ( event: string, callback: () => void ) => void;
};

type ExtendedWindow = Window & {
	elementor?: { channels?: { panelElements?: Channel } };
};

export function useIsDragging() {
	const [ isDragging, setIsDragging ] = useState( false );

	useEffect( () => {
		const channel = ( window as unknown as ExtendedWindow ).elementor?.channels?.panelElements;

		if ( ! channel ) {
			return;
		}

		const onStart = () => setIsDragging( true );
		const onEnd = () => setIsDragging( false );

		channel.on( 'element:drag:start', onStart );
		channel.on( 'element:drag:end', onEnd );

		return () => {
			channel.off( 'element:drag:start', onStart );
			channel.off( 'element:drag:end', onEnd );
		};
	}, [] );

	return isDragging;
}
