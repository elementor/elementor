import { createTransformer } from '../create-transformer';

type TransformOrigin = {
	x: string;
	y: string;
	z: string;
};

const EMPTY_VALUE = '0px';

function getVal( val: string ) {
	return `${ val ?? EMPTY_VALUE }`;
}

export const transformOriginTransformer = createTransformer( ( value: TransformOrigin ) => {
	return `${ getVal( value.x ) } ${ getVal( value.y ) } ${ getVal( value.z ) }`;
} );
