import { createMultiPropsValue } from '../../renderers/multi-props';
import { createTransformer } from '../create-transformer';

type Stroke = {
	width?: string;
	color?: string;
};

export const strokeTransformer = createTransformer( ( value: Stroke ) => {
	const parsed = {
		'-webkit-text-stroke': `${ value.width } ${ value.color }`,
		stroke: `${ value.color }`,
		'stroke-width': `${ value.width }`,
	};

	return createMultiPropsValue( parsed );
} );
