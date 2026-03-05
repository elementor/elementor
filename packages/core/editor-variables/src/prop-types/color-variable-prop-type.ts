import { createPropUtils } from '@elementor/editor-props';
import { z } from '@elementor/schema';

export const colorVariablePropTypeUtil = createPropUtils( 'global-color-variable', z.string() );
