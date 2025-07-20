import type { CssClassUsage, EnhancedCssClassUsage } from './types';

export const transformData = ( data: CssClassUsage ): EnhancedCssClassUsage =>
	Object.entries( data ).reduce< EnhancedCssClassUsage >( ( acc, [ key, value ] ) => {
		acc[ key ] = {
			content: value || [],
			total: value.reduce( ( total, val ) => total + ( val?.total || 0 ), 0 ),
		};
		return acc;
	}, {} );
