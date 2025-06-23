import { createTransformer } from '../create-transformer';

type Position = {
	x?: string;
	y?: string;
};

export const positionTransformer = createTransformer( ( { x, y }: Position ) => `${ x ?? '0px' } ${ y ?? '0px' }` );
