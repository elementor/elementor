import { __useSelector as useSelector } from '@elementor/store';

import { selectClass } from '../store';

export const useCssClassById = ( id ) => {
	return useSelector( ( state ) => selectClass( state, id ) );
};
