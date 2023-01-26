import { useSelector, SliceState } from '@elementor/store';
import { Document, Slice } from '../types';

type State = SliceState<Slice>;

export function useCurrentDocument(): Document | null {
	return useSelector( ( state: State ) => {
		// TODO: Weird?
		return state.documents.documents[ state.documents.currentDocumentId ] || null;
	} );
}
