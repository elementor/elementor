import { createTransformer } from '../create-transformer';

type TransformChildren = {
	x: string;
	y: string;
};

const FALLBACK = '0px';

function getVal( val: string ) {
	return `${ val ?? FALLBACK }`;
}

export const perspectiveOriginTransformer = createTransformer(
	( value: TransformChildren ) => `${ getVal( value?.x ) } ${ getVal( value?.y ) }`
);
