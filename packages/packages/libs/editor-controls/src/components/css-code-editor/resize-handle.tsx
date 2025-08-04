import * as React from 'react';

import { ResizeHandle } from './css-editor.styles';

type ResizeHandleProps = {
	onResize: ( height: number ) => void;
	containerRef: React.RefObject< HTMLDivElement >;
	onHeightChange?: ( height: number ) => void;
};

export const ResizeHandleComponent = ( { onResize, containerRef, onHeightChange }: ResizeHandleProps ) => {
	const handleResizeMove = React.useCallback(
		( e: MouseEvent ) => {
			const container = containerRef.current;
			if ( ! container ) {
				return;
			}
			const containerRect = container.getBoundingClientRect();
			const newHeight = Math.max( 100, e.clientY - containerRect.top );
			onHeightChange?.( newHeight );
			onResize( newHeight );
		},
		[ containerRef, onResize, onHeightChange ]
	);

	const handleResizeEnd = React.useCallback( () => {
		document.removeEventListener( 'mousemove', handleResizeMove );
		document.removeEventListener( 'mouseup', handleResizeEnd );
	}, [ handleResizeMove ] );

	const handleResizeStart = React.useCallback(
		( e: React.MouseEvent ) => {
			e.preventDefault();
			e.stopPropagation();
			document.addEventListener( 'mousemove', handleResizeMove );
			document.addEventListener( 'mouseup', handleResizeEnd );
		},
		[ handleResizeMove, handleResizeEnd ]
	);

	React.useEffect( () => {
		return () => {
			document.removeEventListener( 'mousemove', handleResizeMove );
			document.removeEventListener( 'mouseup', handleResizeEnd );
		};
	}, [ handleResizeMove, handleResizeEnd ] );

	return (
		<ResizeHandle
			onMouseDown={ handleResizeStart }
			aria-label="Resize editor height"
			title="Drag to resize editor height"
		/>
	);
};
