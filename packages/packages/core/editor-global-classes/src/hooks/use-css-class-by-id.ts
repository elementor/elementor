import { type StyleDefinitionID } from '@elementor/editor-styles';
import { __useSelector as useSelector, type SliceState } from '@elementor/store';

import { selectClass, type slice } from '../store';

export const useCssClassById = ( id: StyleDefinitionID ) => {
	return useSelector( ( state: SliceState< typeof slice > ) => selectClass( state, id ) );
};
