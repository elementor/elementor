import { type StyleDefinitionID } from '@elementor/editor-styles';

import { type GlobalClassIndexEntry } from '../api';

export function createLabelsForClasses( entries: GlobalClassIndexEntry[] ): Record< StyleDefinitionID, string > {
	return Object.fromEntries( entries.map( ( e ) => [ e.id, e.label ] ) );
}
