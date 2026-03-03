import { createTransformer } from '../create-transformer';

export type TransformOrigin = {
	x: string;
	y: string;
	z: string;
};

const EMPTY_VALUE = '0px';
const DEFAULT_XY = '50%';
const DEFAULT_Z = EMPTY_VALUE;

function getVal( val: string ) {
	return `${ val ?? EMPTY_VALUE }`;
}

export const transformOriginTransformer = createTransformer( ( value: TransformOrigin ) => {
	const x = getVal( value.x );
	const y = getVal( value.y );
	const z = getVal( value.z );

	if ( x === DEFAULT_XY && y === DEFAULT_XY && z === DEFAULT_Z ) {
		return null;
	}

	return `${ x } ${ y } ${ z }`;
} );
