import * as React from 'react';
import { type ReactNode, useState } from 'react';
import { Button, Collapse, Stack, styled } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { CollapseIcon } from './collapse-icon';

type StaticItem< T = unknown > = T extends ( ...args: unknown[] ) => unknown ? never : T;

type CallbackItem< T > = ( isOpen: boolean ) => T;
export type CollapsibleValue< T > = CallbackItem< T > | StaticItem< T >;

type CollapsibleContentProps = React.PropsWithChildren< {
	defaultOpen?: boolean;
	titleEnd?: CollapsibleValue< ReactNode | string > | null;
} >;

const IndicatorsWrapper = styled( 'div' )`
	position: absolute;
	top: 0;
	right: ${ ( { theme } ) => theme.spacing( 3 ) };
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
`;

export const CollapsibleContent = ( { children, defaultOpen = false, titleEnd = null }: CollapsibleContentProps ) => {
	const [ open, setOpen ] = useState( defaultOpen );

	const handleToggle = () => {
		setOpen( ( prevOpen ) => ! prevOpen );
	};

	return (
		<Stack>
			<Stack sx={ { position: 'relative' } }>
				<Button
					fullWidth
					size="small"
					color="secondary"
					variant="outlined"
					onClick={ handleToggle }
					endIcon={ <CollapseIcon open={ open } /> }
					sx={ { my: 0.5 } }
				>
					{ open ? __( 'Show less', 'elementor' ) : __( 'Show more', 'elementor' ) }
				</Button>
				{ titleEnd && <IndicatorsWrapper>{ getCollapsibleValue( titleEnd, open ) }</IndicatorsWrapper> }
			</Stack>
			<Collapse in={ open } timeout="auto" unmountOnExit>
				{ children }
			</Collapse>
		</Stack>
	);
};

export function getCollapsibleValue< T >( value: CollapsibleValue< T >, isOpen: boolean ): T {
	if ( typeof value === 'function' ) {
		return ( value as CallbackItem< T > )( isOpen );
	}

	return value;
}
