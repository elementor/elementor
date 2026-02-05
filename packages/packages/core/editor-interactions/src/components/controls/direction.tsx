import * as React from 'react';
import { useMemo } from 'react';
import { type ToggleButtonGroupItem, ToggleButtonGroupUi } from '@elementor/editor-controls';
import { ArrowDownSmallIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpSmallIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { type DirectionFieldProps } from '../../types';

type Direction = 'top' | 'bottom' | 'left' | 'right';

export function Direction( { value, onChange, interactionType }: DirectionFieldProps ) {
	const options: ToggleButtonGroupItem< Direction >[] = useMemo( () => {
		const isIn = interactionType === 'in';

		return [
			{
				value: 'top',
				label: isIn ? __( 'From top', 'elementor' ) : __( 'To top', 'elementor' ),
				renderContent: ( { size } ) =>
					isIn ? <ArrowDownSmallIcon fontSize={ size } /> : <ArrowUpSmallIcon fontSize={ size } />,
				showTooltip: true,
			},
			{
				value: 'bottom',
				label: interactionType === 'in' ? __( 'From bottom', 'elementor' ) : __( 'To bottom', 'elementor' ),
				renderContent: ( { size } ) =>
					isIn ? <ArrowUpSmallIcon fontSize={ size } /> : <ArrowDownSmallIcon fontSize={ size } />,
				showTooltip: true,
			},
			{
				value: 'left',
				label: interactionType === 'in' ? __( 'From left', 'elementor' ) : __( 'To left', 'elementor' ),
				renderContent: ( { size } ) =>
					isIn ? <ArrowRightIcon fontSize={ size } /> : <ArrowLeftIcon fontSize={ size } />,
				showTooltip: true,
			},
			{
				value: 'right',
				label: interactionType === 'in' ? __( 'From right', 'elementor' ) : __( 'To right', 'elementor' ),
				renderContent: ( { size } ) =>
					isIn ? <ArrowLeftIcon fontSize={ size } /> : <ArrowRightIcon fontSize={ size } />,
				showTooltip: true,
			},
		];
	}, [ interactionType ] );

	return <ToggleButtonGroupUi items={ options } exclusive onChange={ onChange } value={ value } />;
}
