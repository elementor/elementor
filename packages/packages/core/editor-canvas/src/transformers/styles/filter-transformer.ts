import { createTransformer } from '../create-transformer';

type DropShadowArgs = { xAxis: string; yAxis: string; blur: string; color: string };

type FilterValue = { func: string; args: string | DropShadowArgs };

export const filterTransformer = createTransformer( ( filterValues: FilterValue[] ) => {
	if ( filterValues?.length < 1 ) {
		return null;
	}

	return filterValues.filter( Boolean ).map( mapToFilterFunctionString ).join( ' ' );
} );

const mapToFilterFunctionString = ( value: FilterValue ): string => {
	if ( value.func === 'drop-shadow' ) {
		const { xAxis, yAxis, blur, color } = value.args as DropShadowArgs;
		return `drop-shadow(${ xAxis || '0px' } ${ yAxis || '0px' } ${ blur || '10px' } ${ color || 'transparent' })`;
	}

	if ( ! value.func || ! value.args ) {
		return '';
	}

	return `${ value.func }(${ value.args })`;
};
