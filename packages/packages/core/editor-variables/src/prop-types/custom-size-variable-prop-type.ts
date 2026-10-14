import { createPropUtils } from '@elementor/editor-props';
import { z } from '@elementor/schema';

export const customSizeVariablePropTypeUtil = createPropUtils( 'global-custom-size-variable', z.string() );
