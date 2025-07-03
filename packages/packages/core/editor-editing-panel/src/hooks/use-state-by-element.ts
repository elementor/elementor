import { useState } from 'react';
import { isExperimentActive } from '@elementor/editor-v1-adapters';
import { getSessionStorageItem, setSessionStorageItem } from '@elementor/session';

import { useElement } from '../contexts/element-context';
import { EXPERIMENTAL_FEATURES } from '../sync/experiments-flags';

export const useStateByElement = < T >( key: string, initialValue: T ) => {
	const { element } = useElement();
	const isFeatureActive = isExperimentActive( EXPERIMENTAL_FEATURES.V_3_30 );
	const lookup = `elementor/editor-state/${ element.id }/${ key }`;
	const storedValue = isFeatureActive ? getSessionStorageItem< T >( lookup ) : initialValue;
	const [ value, setValue ] = useState( storedValue ?? initialValue );

	const doUpdate = ( newValue: T ) => {
		setSessionStorageItem( lookup, newValue );
		setValue( newValue );
	};

	return [ value, doUpdate ] as const;
};
