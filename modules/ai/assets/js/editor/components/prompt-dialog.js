import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, Paper } from '@elementor/ui';
import Draggable from 'react-draggable';
import DialogHeader from './dialog-header';

const DraggablePaper = ( props ) => {
	const [ controlledPosition, setControlledPosition ] = useState( { x: 0, y: 0 } );
	const paperRef = useRef( null );
	const timeout = useRef( null );

	const onControlledDrag = ( _e, { x, y } ) => setControlledPosition( { x, y } );

	const handlePositionBoundries = () => {
		clearTimeout( timeout.current );

		// Ensuring the dialog header, which is used as the dialog dragging handle, does not exceed the screen.
		timeout.current = setTimeout( () => {
			const dialogTop = paperRef.current?.getBoundingClientRect().top;

			if ( dialogTop < 0 ) {
				setControlledPosition( ( prev ) => ( { ...prev, y: prev.y - dialogTop } ) );
			}
		}, 50 );
	};

	useEffect( () => {
		const myObserver = new ResizeObserver( handlePositionBoundries );

		myObserver.observe( paperRef.current );

		return () => {
			myObserver.disconnect();
		};
	}, [] );

	return (
		<Draggable
			position={ controlledPosition }
			onDrag={ onControlledDrag }
			handle=".MuiAppBar-root"
			cancel={ '[class*="MuiDialogContent-root"]' }
			bounds="parent"
		>
			<Paper { ...props } ref={ paperRef } />
		</Draggable>
	);
};

const PromptDialog = ( props ) => {
	return (
		<Dialog
			scroll="paper"
			open={ true }
			fullWidth={ true }
			hideBackdrop={ true }
			PaperComponent={ DraggablePaper }
			disableScrollLock={ true }
			sx={ {
				'& .MuiDialog-container': {
					alignItems: 'flex-start',
					mt: '18vh',
				},
			} }
			PaperProps={ {
				sx: {
					m: 0,
					maxHeight: '76vh',
				},
			} }
			{ ...props }
		>
			{ props.children }
		</Dialog>
	);
};

PromptDialog.propTypes = {
	onClose: PropTypes.func.isRequired,
	children: PropTypes.node.isRequired,
	maxWidth: PropTypes.oneOf( [ 'xs', 'sm', 'md', 'lg', 'xl', false ] ),
};

PromptDialog.Header = DialogHeader;
PromptDialog.Content = DialogContent;

export default PromptDialog;
