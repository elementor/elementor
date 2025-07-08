import { createTransformer } from '../create-transformer';

type TransformRotate = {
	x: string;
	y: string;
	z: string;
};

export const transformRotateTransformer = createTransformer( ( value: TransformRotate ) => {
	const transforms = [];

	if ( value.x[ 0 ] !== '0' ) {
		transforms.push( `rotateX(${ value.x })` );
	}

	if ( value.y[ 0 ] !== '0' ) {
		transforms.push( `rotateY(${ value.y })` );
	}

	if ( value.z[ 0 ] !== '0' ) {
		transforms.push( `rotateZ(${ value.z })` );
	}

	return transforms.join( ' ' );
} );
