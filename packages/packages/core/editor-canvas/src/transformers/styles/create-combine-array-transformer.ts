import { createTransformer } from '../create-transformer';

export const createCombineArrayTransformer = ( delimiter: string ) => {
	return createTransformer( ( value: Array< string | number > ) =>
		value?.length ? value.filter( Boolean ).join( delimiter ) : null
	);
};
