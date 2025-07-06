import { __useSelector as useSelector } from '@elementor/store';

import { selectOrder } from '../store';

export const useClassesOrder = () => {
	return useSelector( selectOrder );
};
