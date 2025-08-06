import { createTransformer } from '../create-transformer';

type TransformOrigin = {
	x: string;
	y: string;
	z: string;
};

const defaultOrigin = '0px';

export const transformOriginTransformer = createTransformer( ( value: TransformOrigin ) => {
	return `${ value.x ?? defaultOrigin } ${ value.y ?? defaultOrigin } ${ value.z ?? defaultOrigin }`;
} );
