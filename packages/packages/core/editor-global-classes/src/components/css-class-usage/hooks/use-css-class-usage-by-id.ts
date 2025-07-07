import { type EnhancedCssClassUsageContent } from '../types';
import { useCssClassUsage } from './use-css-class-usage';

const EMPTY_CLASS_USAGE: EnhancedCssClassUsageContent = {
	total: 0,
	content: [],
};

export type UseCssClassUsageByIDResponse = {
	data: EnhancedCssClassUsageContent;
	isLoading: boolean;
};

export const useCssClassUsageByID = ( id: string ): UseCssClassUsageByIDResponse => {
	const { data, isLoading } = useCssClassUsage();
	console.log({data,isLoading})
	const classData = ! data?.[ id ] ? EMPTY_CLASS_USAGE : data[ id ];

	return { data: classData, isLoading };
};
