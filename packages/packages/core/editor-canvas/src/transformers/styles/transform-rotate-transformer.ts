import { createTransformer } from '../create-transformer';

type TransformRotate = {
	x: string;
	y: string;
	z: string;
};

export const transformRotateTransformer = createTransformer( ( value: TransformRotate ) => {
	const transforms = [ `rotateX(${ value.x })`, `rotateY(${ value.y })`, `rotateZ(${ value.z })` ];

	return transforms.join( ' ' );
} );
