import { __useDispatch as useDispatch, __useSelector as useSelector } from '@elementor/store';

import { selectIsOpen } from '../store/selectors';
import { slice } from '../store/slice';
import { type DockMode, type LogicalPosition } from '../types';

export function useFloatingPanelActions( id: string ) {
	const dispatch = useDispatch();
	const isOpen = useSelector( ( state ) => selectIsOpen( state, id ) );

	const open = () => {
		dispatch( slice.actions.open( id ) );
		dispatch( slice.actions.bringToFront( id ) );
	};

	const close = () => dispatch( slice.actions.close( id ) );

	return {
		open,
		close,
		toggle: () => ( isOpen ? close() : open() ),
		setMode: ( mode: DockMode ) => dispatch( slice.actions.setMode( { id, mode } ) ),
		setPosition: ( position: LogicalPosition ) => dispatch( slice.actions.setPosition( { id, position } ) ),
		focus: () => dispatch( slice.actions.bringToFront( id ) ),
	};
}
