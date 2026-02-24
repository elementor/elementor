import * as React from 'react';
import { type MouseEvent, useRef } from 'react';
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
};

export function PromotionSelect( {
	value,
	onChange,
	baseOptions,
	disabledOptions,
	promotionLabel,
	promotionContent,
	upgradeUrl,
}: PromotionSelectProps ) {
	const promotionRef = useRef< InteractionsPromotionChipRef >( null );
	const anchorRef = useRef< HTMLElement >( null );

	return (
		<Select
			value={ value }
			onChange={ ( e: SelectChangeEvent< string > ) => onChange?.( e.target.value ) }
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
				/>
			</MenuSubheader>

			{ Object.entries( disabledOptions ).map( ( [ key, label ] ) => (
				<MenuListItem key={ key } value={ key } disabled sx={ { pl: 3 } }>
					{ label }
				</MenuListItem>
			) ) }
		</Select>
	);
}
