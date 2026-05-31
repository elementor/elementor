import { __useSelector as useSelector } from '@elementor/store';

import { type GlobalState, selectIsOpen, selectPosition, selectSize } from '../store/selectors';

export function useFloatingPanelStatus( id: string ) {
	const isOpen = useSelector( ( state: GlobalState ) => selectIsOpen( state, id ) );
	const position = useSelector( ( state: GlobalState ) => selectPosition( state, id ) );
	const size = useSelector( ( state: GlobalState ) => selectSize( state, id ) );

	return { isOpen, position, size };
}
