import { useEffect, useMemo, useRef } from 'react';
import { type Breakpoint, useActiveBreakpoint, useBreakpoints } from '@elementor/editor-responsive';

const serializeBreakpoints = ( breakpoints: Breakpoint[] ) =>
	breakpoints.map( ( b ) => [ b.id, b.width ?? '', b.type ?? '' ].join( ':' ) ).join( '|' );

export const useRepeaterPopoverDismissOnScreenSignals = ( {
	isOpen,
	onClose,
}: {
	isOpen: boolean;
	onClose: () => void;
} ) => {
	const onCloseRef = useRef( onClose );
	onCloseRef.current = onClose;

	const activeBreakpoint = useActiveBreakpoint();
	const breakpoints = useBreakpoints();
	const breakpointsSignature = useMemo( () => serializeBreakpoints( breakpoints ), [ breakpoints ] );

	const prevActiveBreakpointRef = useRef< typeof activeBreakpoint >( undefined );
	const prevBreakpointsSignatureRef = useRef< string | null >( null );

	useEffect( () => {
		if ( ! isOpen ) {
			prevActiveBreakpointRef.current = activeBreakpoint;
			prevBreakpointsSignatureRef.current = breakpointsSignature;
			return;
		}

		const previousBreakpoint = prevActiveBreakpointRef.current;
		if ( previousBreakpoint !== undefined && previousBreakpoint !== activeBreakpoint ) {
			onCloseRef.current();
		}
		prevActiveBreakpointRef.current = activeBreakpoint;

		const previousSignature = prevBreakpointsSignatureRef.current;
		if ( previousSignature !== null && previousSignature !== breakpointsSignature ) {
			onCloseRef.current();
		}
		prevBreakpointsSignatureRef.current = breakpointsSignature;
	}, [ activeBreakpoint, breakpointsSignature, isOpen ] );

	useEffect( () => {
		if ( ! isOpen ) {
			return;
		}
		const onKeyDown = ( event: KeyboardEvent ) => {
			if ( event.key === 'Escape' ) {
				onCloseRef.current();
			}
		};
		document.addEventListener( 'keydown', onKeyDown );
		return () => {
			document.removeEventListener( 'keydown', onKeyDown );
		};
	}, [ isOpen ] );
};
