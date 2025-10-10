import { apiClient } from '../src/api';
import type { EnhancedCssClassUsage } from '../src/components/css-class-usage/types';
import { transformData } from '../src/components/css-class-usage/utils';

export const fetchCssClassUsage = async (): Promise< EnhancedCssClassUsage > => {
	const response = await apiClient.usage();
	return transformData( response.data.data );
};
