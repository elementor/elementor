import { createPropUtils } from '@elementor/editor-props';
import { z } from '@elementor/schema';

export const fontVariablePropTypeUtil = createPropUtils( 'global-font-variable', z.string() );
