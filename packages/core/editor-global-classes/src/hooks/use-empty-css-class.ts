import { __useSelector } from '@elementor/store';

import { selectEmptyCssClass, selectGlobalClasses } from '../store';

export const useEmptyCssClass = () => {
	return __useSelector( selectEmptyCssClass );
};

export const useAllCssClassesIDs = () => {
	const cssClasses = __useSelector( selectGlobalClasses );
	return Object.keys( cssClasses );
};
