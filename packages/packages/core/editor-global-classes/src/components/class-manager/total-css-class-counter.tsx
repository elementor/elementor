import * as React from 'react';
import { Chip } from '@elementor/ui';

import { useClassesOrder } from '../../hooks/use-classes-order';
import { useFilters } from '../../hooks/use-filters';

export const TotalCssClassCounter = () => {
	const filters = useFilters();
	const cssClasses = useClassesOrder();

	return (
		<Chip
			size={ 'small' }
			label={ filters ? `${ filters.length } / ${ cssClasses?.length }` : cssClasses?.length }
		/>
	);
};
