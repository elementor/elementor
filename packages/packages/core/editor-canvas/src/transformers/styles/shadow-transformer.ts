import { createTransformer } from '../create-transformer';

type Shadow = {
	hOffset?: string;
	vOffset?: string;
	blur?: string;
	spread?: string;
	color?: string;
	position?: string;
};

export const shadowTransformer = createTransformer( ( value: Shadow ) => {
	return [ value.hOffset, value.vOffset, value.blur, value.spread, value.color, value.position ]
		.filter( Boolean )
		.join( ' ' );
} );
