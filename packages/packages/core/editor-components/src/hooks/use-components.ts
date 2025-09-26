import { __useSelector as useSelector } from '@elementor/store';

import { selectComponents, selectLoadIsPending } from '../store';

export const useComponents = () => {
	const components = useSelector( selectComponents );
	const isLoading = useSelector( selectLoadIsPending );

	return { components, isLoading };
};
