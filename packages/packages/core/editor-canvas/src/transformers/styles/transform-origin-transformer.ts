import { createTransformer } from '../create-transformer';

type TransformOrigin = {
	x: string;
	y: string;
	z: string;
};

const defaultMove = '0px';

export const transformOriginTransformer = createTransformer( ( value: TransformOrigin ) => {
	return `${ value.x ?? defaultMove }, ${ value.y ?? defaultMove }, ${ value.z ?? defaultMove }`;
} );
