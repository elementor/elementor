import { getElementStateParamsInScope } from '@elementor/editor-elements';
import { __ } from '@wordpress/i18n';

import { type NormalizedVariable } from '../types';

export const STATE_VARIABLE_ID_PREFIX = 'e-state-';

const VARIABLE_TYPE_BY_PROP_TYPE: Record< string, string > = {
	color: 'color',
	size: 'size',
	number: 'size',
};

export const isStateVariableKey = ( key: string ) => key.startsWith( STATE_VARIABLE_ID_PREFIX );

const toDisplayValue = ( value: unknown ): string => {
	const raw = value && typeof value === 'object' && 'value' in value ? ( value as { value: unknown } ).value : value;

	if ( raw && typeof raw === 'object' && 'size' in raw ) {
		const { size, unit } = raw as { size: unknown; unit?: string };

		return `${ size }${ unit ?? '' }`;
	}

	return String( raw ?? '' );
};

export const getStateVariables = (
	elementId: string | null | undefined,
	variableType: string
): NormalizedVariable[] => {
	if ( ! elementId ) {
		return [];
	}

	return getElementStateParamsInScope( elementId )
		.filter( ( param ) => VARIABLE_TYPE_BY_PROP_TYPE[ param.prop_type ?? param.type ] === variableType )
		.map( ( param ) => ( {
			key: `${ STATE_VARIABLE_ID_PREFIX }${ param.key }`,
			label: `${ __( 'State', 'elementor' ) }: ${ param.label || param.key }`,
			value: toDisplayValue( param.default ),
		} ) );
};
