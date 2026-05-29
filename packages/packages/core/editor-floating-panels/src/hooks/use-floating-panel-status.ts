import { __useSelector as useSelector } from '@elementor/store';

import { type GlobalState, selectIsOpen, selectMode, selectPosition, selectSize } from '../store/selectors';

export function useFloatingPanelStatus( id: string ) {
	const isOpen = useSelector( ( state: GlobalState ) => selectIsOpen( state, id ) );
	const mode = useSelector( ( state: GlobalState ) => selectMode( state, id ) );
	const position = useSelector( ( state: GlobalState ) => selectPosition( state, id ) );
	const size = useSelector( ( state: GlobalState ) => selectSize( state, id ) );

	return { isOpen, mode, position, size };
}
