import { createTransformer } from '../create-transformer';

type TransformScale = {
	x: string;
	y: string;
	z: string;
};

export const transformScaleTransformer = createTransformer( ( value: TransformScale ) => {
	return `scale3d(${ value.x ?? 1 }, ${ value.y ?? 1 }, ${ value.z ?? 1 })`;
} );
