import { createPropUtils } from '@elementor/editor-props';
import { z } from '@elementor/schema';

export const sizeVariablePropTypeUtil = createPropUtils( 'global-size-variable', z.string() );
