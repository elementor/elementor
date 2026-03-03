import { z } from '@elementor/schema';

import { createPropUtils } from '../utils/create-prop-utils';

export const CLASSES_PROP_KEY = 'classes';

export const classesPropTypeUtil = createPropUtils(
	CLASSES_PROP_KEY,
	z.array( z.string().regex( /^[a-z][a-z-_0-9]*$/i ) )
);

export type ClassesPropValue = z.infer< typeof classesPropTypeUtil.schema >;
