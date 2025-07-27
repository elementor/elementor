import { createTransformer } from '../create-transformer';

type TransformRotate = {
	x: string;
	y: string;
	z: string;
};

const defaultRotate = '0deg';

export const transformRotateTransformer = createTransformer( ( value: TransformRotate ) => {
	const transforms = [
		`rotateX(${ value?.x ?? defaultRotate })`,
		`rotateY(${ value?.y ?? defaultRotate })`,
		`rotateZ(${ value?.z ?? defaultRotate })`,
	];

	return transforms.join( ' ' );
} );
