import { useState } from 'react';
import { getSessionStorageItem, setSessionStorageItem } from '@elementor/session';

import { useElement } from '../contexts/element-context';

export const useStateByElement = < T >( key: string, initialValue: T ) => {
	const { element } = useElement();
	const lookup = `elementor/editor-state/${ element.id }/${ key }`;
	const storedValue = getSessionStorageItem< T >( lookup );
	const [ value, setValue ] = useState( storedValue ?? initialValue );

	const doUpdate = ( newValue: T ) => {
		setSessionStorageItem( lookup, newValue );
		setValue( newValue );
	};

	return [ value, doUpdate ] as const;
};
