import { useEffect, useState } from 'react';

import { type PanelExtendedWindow } from './types';

export function useIsDragging() {
	const [ isDragging, setIsDragging ] = useState( false );

	useEffect( () => {
		const channel = ( window as unknown as PanelExtendedWindow ).elementor?.channels?.panelElements;

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
