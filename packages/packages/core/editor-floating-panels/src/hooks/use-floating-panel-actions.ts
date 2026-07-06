import { __useDispatch as useDispatch, __useSelector as useSelector } from '@elementor/store';

import { type GlobalState, selectIsOpen } from '../store/selectors';
import { slice } from '../store/slice';
import { type LogicalPosition, type LogicalSize } from '../types';

export function useFloatingPanelActions( id: string ) {
	const dispatch = useDispatch();
	const isOpen = useSelector( ( state: GlobalState ) => selectIsOpen( state, id ) );

	const open = () => {
		dispatch( slice.actions.open( id ) );
		dispatch( slice.actions.bringToFront( id ) );
	};

	const close = () => dispatch( slice.actions.close( id ) );

	return {
		open,
		close,
		toggle: () => ( isOpen ? close() : open() ),
		setPosition: ( position: LogicalPosition ) => dispatch( slice.actions.setPosition( { id, position } ) ),
		setSize: ( size: LogicalSize ) => dispatch( slice.actions.setSize( { id, size } ) ),
		focus: () => dispatch( slice.actions.bringToFront( id ) ),
	};
}
