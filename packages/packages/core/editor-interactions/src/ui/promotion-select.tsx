import * as React from 'react';
import { type KeyboardEvent, type MouseEvent, useCallback, useRef } from 'react';
import { type PromotionTrackingData } from '@elementor/editor-controls';
import { MenuListItem } from '@elementor/editor-ui';
import { MenuSubheader, Select, type SelectChangeEvent } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { InteractionsPromotionChip, type InteractionsPromotionChipRef } from './interactions-promotion-chip';

type PromotionSelectProps = {
	value: string;
	onChange?: ( value: string ) => void;
	baseOptions: Record< string, string >;
	disabledOptions: Record< string, string >;
	promotionLabel?: string;
	promotionContent: string;
	upgradeUrl: string;
	trackingData: PromotionTrackingData;
};

const LOCKED_OPTION_SX = ( theme: { palette: { action: { disabledOpacity: number } } } ) => ( {
	pl: 3,
	opacity: theme.palette.action.disabledOpacity,
	cursor: 'not-allowed',
} );

export function PromotionSelect( {
	value,
	onChange,
	baseOptions,
	disabledOptions,
	promotionLabel,
	promotionContent,
	upgradeUrl,
	trackingData,
}: PromotionSelectProps ) {
	const promotionRef = useRef< InteractionsPromotionChipRef >( null );
	const anchorRef = useRef< HTMLElement >( null );

	const openPromotionForOption = useCallback( ( optionKey: string ) => {
		promotionRef.current?.toggle( { target_value: optionKey } );
	}, [] );

	const handleSelectChange = ( e: SelectChangeEvent< string > ) => {
		if ( Object.prototype.hasOwnProperty.call( disabledOptions, e.target.value ) ) {
			return;
		}

		onChange?.( e.target.value );
	};

	const handleLockedOptionActivate = ( optionKey: string, event: MouseEvent | KeyboardEvent ) => {
		event.preventDefault();
		event.stopPropagation();
		openPromotionForOption( optionKey );
	};

	return (
		<Select
			value={ value }
			onChange={ handleSelectChange }
			fullWidth
			displayEmpty
			size="tiny"
			MenuProps={ { disablePortal: true } }
		>
			{ Object.entries( baseOptions ).map( ( [ key, label ] ) => (
				<MenuListItem key={ key } value={ key }>
					{ label }
				</MenuListItem>
			) ) }

			<MenuSubheader
				ref={ anchorRef }
				sx={ {
					cursor: 'pointer',
					color: 'text.tertiary',
					fontWeight: '400',
					display: 'flex',
					alignItems: 'center',
				} }
				onMouseDown={ ( e: MouseEvent ) => {
					e.stopPropagation();
					promotionRef.current?.toggle();
				} }
			>
				{ promotionLabel ?? __( 'PRO features', 'elementor' ) }
				<InteractionsPromotionChip
					content={ promotionContent }
					upgradeUrl={ upgradeUrl }
					ref={ promotionRef }
					anchorRef={ anchorRef }
					trackingData={ trackingData }
				/>
			</MenuSubheader>

			{ Object.entries( disabledOptions ).map( ( [ key, label ] ) => (
				<MenuListItem
					key={ key }
					value={ key }
					aria-disabled
					sx={ LOCKED_OPTION_SX }
					onMouseDown={ ( e: MouseEvent ) => handleLockedOptionActivate( key, e ) }
					onKeyDown={ ( e: KeyboardEvent ) => {
						if ( 'Enter' === e.key || ' ' === e.key ) {
							handleLockedOptionActivate( key, e );
						}
					} }
				>
					{ label }
				</MenuListItem>
			) ) }
		</Select>
	);
}
