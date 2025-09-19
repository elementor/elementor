import { __useSelector as useSelector } from '@elementor/store';

import { selectComponents, selectLoadStatus } from '../store';

export const useComponents = () => {
	return useSelector( selectComponents );
};

export const useLoadStatus = () => {
	return useSelector( selectLoadStatus );
};
