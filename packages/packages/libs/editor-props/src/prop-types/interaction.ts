import { z } from '@elementor/schema';
import { unknownChildrenSchema } from './utils';


import { createPropUtils } from '../utils/create-prop-utils';

export const interactionPropTypeUtil = createPropUtils(
	'interaction',
    unknownChildrenSchema
);

export type interactionPropValue = z.infer<typeof unknownChildrenSchema >; 