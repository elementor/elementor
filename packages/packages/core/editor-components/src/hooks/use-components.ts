import { __useSelector as useSelector } from '@elementor/store';

import { selectComponents } from '../store';

export const useComponents = () => {
	return useSelector( selectComponents );
};
