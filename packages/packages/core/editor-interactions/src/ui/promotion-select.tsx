import * as React from 'react';
import { type MouseEvent, useCallback, useRef, useState } from 'react';
import { type PromotionTrackingData } from '@elementor/editor-controls';
import { MenuListItem, PromotionChip } from '@elementor/editor-ui';
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
	const keepSelectOpenRef = useRef( false );
	const isPromotionOpenRef = useRef( false );
	const [ selectOpen, setSelectOpen ] = useState( false );

	const proSectionLabel = promotionLabel ?? __( 'PRO features', 'elementor' );

	const openPromotionForOption = useCallback( ( optionKey: string ) => {
		window.requestAnimationFrame( () => {
			window.requestAnimationFrame( () => {
				promotionRef.current?.openPromotion( { target_value: optionKey } );
			} );
		} );
	}, [] );

	const handleLockedOptionActivate = useCallback(
		( optionKey: string ) => {
			keepSelectOpenRef.current = true;
			setSelectOpen( true );
			openPromotionForOption( optionKey );
		},
		[ openPromotionForOption ]
	);

	const handleSelectChange = ( e: SelectChangeEvent< string > ) => {
		if ( Object.prototype.hasOwnProperty.call( disabledOptions, e.target.value ) ) {
			return;
		}

		onChange?.( e.target.value );
		setSelectOpen( false );
	};

	const handleSelectClose = () => {
		if ( keepSelectOpenRef.current ) {
			keepSelectOpenRef.current = false;
			setSelectOpen( true );
			return;
		}

		if ( isPromotionOpenRef.current ) {
			promotionRef.current?.closePromotion();
			return;
		}

		setSelectOpen( false );
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
			handleLockedOptionActivate( optionKey );
		}
	};

	const handleLockedOptionClickCapture = ( event: MouseEvent< HTMLUListElement > ) => {
		const lockedOption = ( event.target as HTMLElement ).closest( '[data-promotion-locked-option]' );

		if ( ! lockedOption ) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();
	};

	const handlePromotionOpenChange = useCallback( ( open: boolean ) => {
		isPromotionOpenRef.current = open;

		if ( ! open ) {
			keepSelectOpenRef.current = false;
			setSelectOpen( false );
		}
	}, [] );

	return (
		<Box ref={ selectAnchorRef } sx={ { width: '100%', position: 'relative' } }>
			<Select
				value={ value }
				open={ selectOpen }
				onOpen={ () => setSelectOpen( true ) }
				onClose={ handleSelectClose }
				onChange={ handleSelectChange }
				fullWidth
				displayEmpty
				size="tiny"
				MenuProps={ {
					disablePortal: true,
					MenuListProps: {
						onMouseDownCapture: handleLockedOptionMouseDownCapture,
						onClickCapture: handleLockedOptionClickCapture,
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
								handleLockedOptionActivate( optionKey );
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
					{ proSectionLabel }
					<Box aria-hidden sx={ { display: 'inline-flex', pointerEvents: 'none' } }>
						<PromotionChip />
					</Box>
				</MenuSubheader>

				{ Object.entries( disabledOptions ).map( ( [ key, label ] ) => (
					<MenuListItem
						key={ key }
						value={ key }
						data-promotion-locked-option={ key }
						aria-label={ `${ label }, ${ __( 'Pro', 'elementor' ) }` }
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
			<InteractionsPromotionChip
				content={ promotionContent }
				upgradeUrl={ upgradeUrl }
				ref={ promotionRef }
				anchorRef={ selectAnchorRef }
				showTrigger={ false }
				onOpenChange={ handlePromotionOpenChange }
				trackingData={ trackingData }
			/>
		</Box>
	);
}
