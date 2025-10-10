import { __useSelector as useSelector } from '@elementor/store';

import { selectIsDirty } from '../store';

export const useDirtyState = () => {
	return useSelector( selectIsDirty );
};
