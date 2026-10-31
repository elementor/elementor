import * as React from 'react';
import { type MouseEvent, useCallback, useRef } from 'react';
import { type PromotionTrackingData } from '@elementor/editor-controls';
import { MenuListItem } from '@elementor/editor-ui';
import { CrownFilledIcon } from '@elementor/icons';
import { Box, MenuSubheader, Select, type SelectChangeEvent, useTheme } from '@elementor/ui';
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
	const theme = useTheme();
	const promotionRef = useRef< InteractionsPromotionChipRef >( null );
	const selectAnchorRef = useRef< HTMLDivElement >( null );

	const openPromotionForOption = useCallback( ( optionKey: string ) => {
		window.requestAnimationFrame( () => {
			window.requestAnimationFrame( () => {
				promotionRef.current?.openPromotion( { target_value: optionKey } );
			} );
		} );
	}, [] );

	const handleSelectChange = ( e: SelectChangeEvent< string > ) => {
		if ( Object.prototype.hasOwnProperty.call( disabledOptions, e.target.value ) ) {
			return;
		}

		onChange?.( e.target.value );
	};

	const handleLockedOptionMouseDownCapture = ( event: MouseEvent< HTMLUListElement > ) => {
		const lockedOption = ( event.target as HTMLElement ).closest( '[data-promotion-locked-option]' );

		if ( ! lockedOption ) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();

		const optionKey = lockedOption.getAttribute( 'data-promotion-locked-option' );

		if ( optionKey ) {
			openPromotionForOption( optionKey );
		}
	};

	return (
		<Box ref={ selectAnchorRef } sx={ { width: '100%', position: 'relative' } }>
			<Select
				value={ value }
				onChange={ handleSelectChange }
				fullWidth
				displayEmpty
				size="tiny"
				MenuProps={ {
					disablePortal: true,
					MenuListProps: {
						onMouseDownCapture: handleLockedOptionMouseDownCapture,
						onKeyDownCapture: ( event: React.KeyboardEvent< HTMLUListElement > ) => {
							if ( 'Enter' !== event.key && ' ' !== event.key ) {
								return;
							}

							const lockedOption = ( event.target as HTMLElement ).closest(
								'[data-promotion-locked-option]'
							);

							if ( ! lockedOption ) {
								return;
							}

							event.preventDefault();
							event.stopPropagation();

							const optionKey = lockedOption.getAttribute( 'data-promotion-locked-option' );

							if ( optionKey ) {
								openPromotionForOption( optionKey );
							}
						},
					},
				} }
			>
				{ Object.entries( baseOptions ).map( ( [ key, label ] ) => (
					<MenuListItem key={ key } value={ key }>
						{ label }
					</MenuListItem>
				) ) }

				<MenuSubheader
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
					<CrownFilledIcon fontSize="tiny" sx={ { ml: 1, color: 'promotion.main' } } aria-hidden />
				</MenuSubheader>

				{ Object.entries( disabledOptions ).map( ( [ key, label ] ) => (
					<MenuListItem
						key={ key }
						value={ key }
						data-promotion-locked-option={ key }
						sx={ {
							pl: 3,
							opacity: theme.palette.action.disabledOpacity,
							color: theme.palette.action.disabled,
						} }
					>
						{ label }
					</MenuListItem>
				) ) }
			</Select>
			<Box
				sx={ {
					position: 'absolute',
					width: 1,
					height: 1,
					overflow: 'hidden',
					clip: 'rect(0, 0, 0, 0)',
					whiteSpace: 'nowrap',
				} }
				aria-hidden
			>
				<InteractionsPromotionChip
					content={ promotionContent }
					upgradeUrl={ upgradeUrl }
					ref={ promotionRef }
					anchorRef={ selectAnchorRef }
					trackingData={ trackingData }
				/>
			</Box>
		</Box>
	);
}
