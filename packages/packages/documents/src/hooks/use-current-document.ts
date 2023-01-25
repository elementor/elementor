import { useSelector, SliceState } from '@elementor/store';
import { slice } from '../store';
import { Document } from '../types';

type State = SliceState<typeof slice>;

export function useCurrentDocument(): Document | null {
	return useSelector( ( state: State ) => {
		// TODO: Weird?
		return state.documents.documents[ state.documents.currentDocumentId ] || null;
	} );
}
