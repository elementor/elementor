import { createTransformer } from '../create-transformer';

type TransformSkew = {
	x: string;
	y: string;
};

const defaultSkew = '0deg';

export const transformSkewTransformer = createTransformer( ( value: TransformSkew ) => {
	const x = value?.x ?? defaultSkew;
	const y = value?.y ?? defaultSkew;

	return `skew(${ x }, ${ y })`;
} );
