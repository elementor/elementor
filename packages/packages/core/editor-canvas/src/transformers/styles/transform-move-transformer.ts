import { createTransformer } from '../create-transformer';

type TransformMove = {
	x: string;
	y: string;
	z: string;
};

export const transformMoveTransformer = createTransformer( ( value: TransformMove ) => {
	return `translate3d(${ value.x }, ${ value.y }, ${ value.z })`;
} );
