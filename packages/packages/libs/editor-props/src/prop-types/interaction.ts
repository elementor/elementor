import { z } from '@elementor/schema';
import { createPropUtils } from '../utils/create-prop-utils';

// Define the interaction object schema
const interactionSchema = z.strictObject({
    trigger: z.string(),
    animation: z.string(),
    type: z.string(),
    direction: z.string(),
});

export const interactionPropTypeUtil = createPropUtils(
    'interaction',
    interactionSchema
);

export type interactionPropValue = z.infer<typeof interactionSchema>;