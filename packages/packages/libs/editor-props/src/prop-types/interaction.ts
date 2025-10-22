import { z } from '@elementor/schema';
import { createPropUtils } from '../utils/create-prop-utils';

// Define the interaction as a simple string schema
const interactionSchema = z.string().default('fade-in-left');

export const interactionPropTypeUtil = createPropUtils(
    'interaction',
    interactionSchema
);

export type interactionPropValue = z.infer<typeof interactionSchema>;