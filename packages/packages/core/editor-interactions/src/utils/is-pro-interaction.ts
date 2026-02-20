import { getInteractionsControlOptions } from '../interactions-controls-registry';
import { extractString, extractBoolean } from '../utils/prop-value-utils';
import type { InteractionItemPropValue } from '../types';

export function isProInteraction(interaction: InteractionItemPropValue): boolean {
    const value = interaction.value;
    const trigger = extractString(value.trigger);
    const effect = extractString(value.animation.value.effect);
    const easing = extractString(value.animation.value.config?.value.easing);
    const replay = extractBoolean(value.animation.value.config?.value.replay);

    const checks: Array<[string, string]> = [
        ['trigger', trigger],
        ['easing', easing],

    ];

    return checks.some(([controlType, controlValue]) => {
        const supportedOptions = getInteractionsControlOptions(controlType as any);
        // If no options registered (empty array), skip - the control doesn't filter by options
        return supportedOptions.length > 0 && !supportedOptions.includes(controlValue);
        // return false;
    });
}