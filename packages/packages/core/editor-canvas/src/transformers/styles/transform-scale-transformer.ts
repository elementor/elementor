import { createTransformer } from '../create-transformer';

type TransformScale = {
	x: string;
	y: string;
	z: string;
};

export const transformScaleTransformer = createTransformer( ( value: TransformScale ) => {
	return `scale3d(${ value.x }, ${ value.y }, ${ value.z })`;
} );
