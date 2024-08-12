import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, Paper } from '@elementor/ui';
import PropTypes from 'prop-types';
import Draggable from 'react-draggable';
import DialogHeader from './dialog-header';

const DraggablePaper = ( props ) => {
	const [ position, setPosition ] = useState( { x: 0, y: 0 } );
	const paperRef = useRef( null );
	const timeout = useRef( null );

	const onDrag = ( _e, { x, y } ) => setPosition( { x, y } );

	const handlePositionBoundaries = () => {
		clearTimeout( timeout.current );

		// Ensuring the dialog header, which is used as the dialog dragging handle, does not exceed the screen.
		timeout.current = setTimeout( () => {
			const dialogTop = paperRef.current?.getBoundingClientRect().top;

			if ( dialogTop < 0 ) {
				setPosition( ( prev ) => ( { ...prev, y: prev.y - dialogTop } ) );
			}
		}, 50 );
	};

	useEffect( () => {
		const resizeObserver = new ResizeObserver( handlePositionBoundaries );

		resizeObserver.observe( paperRef.current );

		return () => {
			resizeObserver.disconnect();
		};
	}, [] );

	return (
		<Draggable
			position={ position }
			onDrag={ onDrag }
			handle=".MuiAppBar-root"
			cancel={ '[class*="MuiDialogContent-root"]' }
			bounds="parent"
		>
			<Paper { ...props } ref={ paperRef } />
		</Draggable>
	);
};

const PromptDialog = ( props ) => {
	const [ sxStyle, setSxStyle ] = useState( { pointerEvents: 'none' } );
	const timeoutRef = useRef( null );

	return (
		<Dialog
			scroll="paper"
			open={ true }
			fullWidth={ true }
			hideBackdrop={ true }
			PaperComponent={ DraggablePaper }
			disableScrollLock={ true }
			{ ...props }
			sx={ {
				// eslint-disable-next-line react/prop-types
				...props.sx,
				...sxStyle,
				'& .MuiDialog-container': {
					alignItems: 'flex-start',
					mt: '18vh',
				},
			} }
			PaperProps={ {
				// eslint-disable-next-line react/prop-types
				...props.PaperProps,
				onMouseEnter: () => {
					clearTimeout( timeoutRef.current );
					setSxStyle( { pointerEvents: 'all' } );
				},
				onMouseLeave: () => {
					clearTimeout( timeoutRef.current );
					timeoutRef.current = setTimeout( () => {
						setSxStyle( { pointerEvents: 'none' } );
					}, 200 );
				},
				sx: {
					m: 0,
					maxHeight: '76vh',
					pointerEvents: 'auto',
				},
			} }
		>
			{ props.children }
		</Dialog>
	);
};

PromptDialog.propTypes = {
	onClose: PropTypes.func.isRequired,
	children: PropTypes.node,
	maxWidth: PropTypes.oneOf( [ 'xs', 'sm', 'md', 'lg', 'xl', false ] ),
};

PromptDialog.Header = DialogHeader;
PromptDialog.Content = DialogContent;

export default PromptDialog;
