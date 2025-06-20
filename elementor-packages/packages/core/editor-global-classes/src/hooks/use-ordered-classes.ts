import { __useSelector as useSelector } from '@elementor/store';

import { selectOrderedClasses } from '../store';

export const useOrderedClasses = () => {
	return useSelector( selectOrderedClasses );
};
