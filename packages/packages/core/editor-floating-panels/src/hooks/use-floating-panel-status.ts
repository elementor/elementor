import { __useSelector as useSelector } from '@elementor/store';

import { selectIsOpen, selectMode, selectPosition, selectSize } from '../store/selectors';

export function useFloatingPanelStatus( id: string ) {
	const isOpen = useSelector( ( state ) => selectIsOpen( state, id ) );
	const mode = useSelector( ( state ) => selectMode( state, id ) );
	const position = useSelector( ( state ) => selectPosition( state, id ) );
	const size = useSelector( ( state ) => selectSize( state, id ) );

	return { isOpen, mode, position, size };
}
