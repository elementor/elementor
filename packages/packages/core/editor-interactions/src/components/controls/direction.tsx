import * as React from 'react';
import { useMemo } from 'react';
import { StyledToggleButton, StyledToggleButtonGroup } from '@elementor/editor-controls';
import { ArrowDownSmallIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpSmallIcon } from '@elementor/icons';
import { Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type DirectionFieldProps } from '../../types';

type Direction = 'top' | 'bottom' | 'left' | 'right';

const AXIS: Record< Direction, 'vertical' | 'horizontal' > = {
	top: 'vertical',
	bottom: 'vertical',
	left: 'horizontal',
	right: 'horizontal',
};

function parseValue( value: string ): Direction[] {
	return value.split( '-' ).filter( Boolean ) as Direction[];
}

function serializeValue( directions: Direction[] ): string {
	const vertical = directions.find( ( d ) => d === 'top' || d === 'bottom' );
	const horizontal = directions.find( ( d ) => d === 'left' || d === 'right' );
	if ( vertical && horizontal ) {
		return `${ vertical }-${ horizontal }`;
	}
	return directions[ 0 ] ?? '';
}

function toggleDirection( current: Direction[], clicked: Direction ): Direction[] {
	if ( current.includes( clicked ) ) {
		return current.filter( ( d ) => d !== clicked );
	}
	const filtered = current.filter( ( d ) => AXIS[ d ] !== AXIS[ clicked ] );
	return [ ...filtered, clicked ];
}

export function Direction( { value, onChange, interactionType }: DirectionFieldProps ) {
	const isIn = interactionType === 'in';

	const options = useMemo(
		() => [
			{
				dir: 'top' as Direction,
				label: isIn ? __( 'From top', 'elementor' ) : __( 'To top', 'elementor' ),
				Icon: isIn ? ArrowDownSmallIcon : ArrowUpSmallIcon,
			},
			{
				dir: 'bottom' as Direction,
				label: isIn ? __( 'From bottom', 'elementor' ) : __( 'To bottom', 'elementor' ),
				Icon: isIn ? ArrowUpSmallIcon : ArrowDownSmallIcon,
			},
			{
				dir: 'left' as Direction,
				label: isIn ? __( 'From left', 'elementor' ) : __( 'To left', 'elementor' ),
				Icon: isIn ? ArrowRightIcon : ArrowLeftIcon,
			},
			{
				dir: 'right' as Direction,
				label: isIn ? __( 'From right', 'elementor' ) : __( 'To right', 'elementor' ),
				Icon: isIn ? ArrowLeftIcon : ArrowRightIcon,
			},
		],
		[ interactionType ]
	);

	const selectedDirections = useMemo( () => parseValue( value ), [ value ] );

	return (
		<StyledToggleButtonGroup
			size="tiny"
			justify="end"
			sx={ {
				display: 'grid',
				gridTemplateColumns: 'repeat(4, minmax(0, 25%))',
				width: '100%',
			} }
		>
			{ options.map( ( { dir, label, Icon } ) => (
				<Tooltip key={ dir } title={ label } disableFocusListener placement="top">
					<StyledToggleButton
						value={ dir }
						selected={ selectedDirections.includes( dir ) }
						aria-label={ label }
						size="tiny"
						isPlaceholder={ false }
						onChange={ () => {
							const next = toggleDirection( selectedDirections, dir );
							onChange( serializeValue( next ) );
						} }
					>
						<Icon fontSize="tiny" />
					</StyledToggleButton>
				</Tooltip>
			) ) }
		</StyledToggleButtonGroup>
	);
}
