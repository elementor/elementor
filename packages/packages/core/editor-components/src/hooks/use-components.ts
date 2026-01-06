import { __useSelector as useSelector } from '@elementor/store';

import { selectComponents, selectLoadIsPending } from '../store/store';

export const useComponents = () => {
	const components = useSelector( selectComponents );
	const isLoading = useSelector( selectLoadIsPending );

	console.log( 'COMPONENTS: useComponents', components );
	console.log( components );

	return { components, isLoading };
};
