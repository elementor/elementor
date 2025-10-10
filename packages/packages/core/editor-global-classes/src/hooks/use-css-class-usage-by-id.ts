import { type EnhancedCssClassUsageContent } from '../components/css-class-usage/types';
import { useCssClassUsage } from './use-css-class-usage';

const EMPTY_CLASS_USAGE: EnhancedCssClassUsageContent = {
	total: 0,
	content: [],
};

export const useCssClassUsageByID = (
	id: string
): { data: EnhancedCssClassUsageContent; isLoading: boolean; isSuccess?: boolean } => {
	const { data, ...rest } = useCssClassUsage();
	const classData = data?.[ id ] ?? EMPTY_CLASS_USAGE;
	return { ...rest, data: classData };
};
