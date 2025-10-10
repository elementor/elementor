import { __getState as getState } from '@elementor/store';

import { selectActiveDocument } from '../store/selectors';

export function getCurrentDocument() {
	return selectActiveDocument( getState() );
}
