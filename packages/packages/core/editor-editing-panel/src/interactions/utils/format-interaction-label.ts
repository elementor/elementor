import { getInteractionsConfig } from './get-interactions-config';

export function formatInteractionLabel( animationId: string ): string {
	if ( ! animationId ) {
		return '';
	}

	const [ trigger, effect, type, direction, duration, delay ] = animationId.split( '-' );

	const baseValue = `${ trigger }-${ effect }-${ type }-${ direction || '' }`;

	const animationOptions = getInteractionsConfig()?.animationOptions;
	const option = animationOptions.find( ( opt ) => opt.value === baseValue );

	let label = option?.label || animationId;

	if ( duration || delay ) {
		const constants = getInteractionsConfig()?.constants;
		const durationValue = duration || String( constants.defaultDuration );
		const delayValue = delay || String( constants.defaultDelay );

		label += ` (${ durationValue }ms`;

		if ( delayValue !== '0' ) {
			label += `, ${ delayValue }ms delay`;
		}

		label += ')';
	}

	return label;
}
