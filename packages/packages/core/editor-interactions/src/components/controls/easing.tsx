import * as React from 'react';
import { type MouseEvent, useRef } from 'react';
import { MenuListItem } from '@elementor/editor-ui';
import { MenuSubheader, Select } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type FieldProps } from '../../types';
import { InteractionsPromotionChip, type InteractionsPromotionChipRef } from '../../ui/interactions-promotion-chip';

const FREE_EASING_OPTIONS = {
	easeIn: __( 'Ease In', 'elementor' ),
};

const PRO_EASING_OPTIONS = {
	easeInOut: __( 'Ease In Out', 'elementor' ),
	easeOut: __( 'Ease Out', 'elementor' ),
	backIn: __( 'Back In', 'elementor' ),
	backInOut: __( 'Back In Out', 'elementor' ),
	backOut: __( 'Back Out', 'elementor' ),
	linear: __( 'Linear', 'elementor' ),
};

const DEFAULT_EASING = 'easeIn';

export function Easing( {}: FieldProps ) {
	const promotionRef = useRef< InteractionsPromotionChipRef >( null );
	const anchorRef = useRef< HTMLElement >( null );

	const freeOptions = Object.entries( FREE_EASING_OPTIONS ).map( ( [ key, label ] ) => ( { key, label } ) );
	const proOptions = Object.entries( PRO_EASING_OPTIONS ).map( ( [ key, label ] ) => ( { key, label } ) );

	return (
		<Select
			value={ DEFAULT_EASING }
			onChange={ () => {} }
			fullWidth
			displayEmpty
			size="tiny"
			MenuProps={ {
				disablePortal: true,
			} }
		>
			{ freeOptions.map( ( option ) => (
				<MenuListItem key={ option.key } value={ option.key }>
					{ option.label }
				</MenuListItem>
			) ) }

			<MenuSubheader
				sx={ { cursor: 'pointer', color: 'text.tertiary', fontWeight: '400', display: 'flex', alignItems: 'center' } }
				ref={ anchorRef }
				onMouseDown={ ( e: MouseEvent ) => {
					e.stopPropagation();
					promotionRef.current?.toggle();
				} }
			>
				{ __( 'PRO features', 'elementor' ) }
				<InteractionsPromotionChip
					content={ __( 'Upgrade to control the smoothness of the interaction.', 'elementor' ) }
					upgradeUrl="https://go.elementor.com/go-pro-interactions-easing-modal/"
					ref={ promotionRef }
					anchorRef={ anchorRef }
				/>
			</MenuSubheader>

			{ proOptions.map( ( option ) => (
				<MenuListItem key={ option.key } value={ option.key } disabled sx={ { pl: 3 } }>
					{ option.label }
				</MenuListItem>
			) ) }
		</Select>
	);
}
