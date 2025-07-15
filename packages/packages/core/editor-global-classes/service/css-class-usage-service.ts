import { apiClient } from '../../../api';
import { type EnhancedCssClassUsage } from '../types';
import { transformData } from '../utils';

export const fetchCssClassUsage = async (): Promise< EnhancedCssClassUsage > => {
	const response = await apiClient.usage();
	return transformData( response.data.data );
};
