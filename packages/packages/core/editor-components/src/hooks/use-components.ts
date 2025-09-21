import { __useSelector as useSelector } from '@elementor/store';

import { selectComponents, selectLoadStatus } from '../store';

export const useComponents = () => {
	const components = useSelector( selectComponents );
	const loadStatus = useSelector( selectLoadStatus );

	return { components, loadStatus };
};
