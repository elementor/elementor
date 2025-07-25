import { createTransformer } from '../create-transformer';

type TransformMove = {
	x: string;
	y: string;
	z: string;
};

const defaultMove = '0px';

export const transformMoveTransformer = createTransformer( ( value: TransformMove ) => {
	return `translate3d(${ value.x ?? defaultMove }, ${ value.y ?? defaultMove }, ${ value.z ?? defaultMove })`;
} );
