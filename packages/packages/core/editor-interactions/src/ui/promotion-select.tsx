import * as React from 'react';
import { type MouseEvent, useRef } from 'react';
import { MenuListItem } from '@elementor/editor-ui';
import { MenuSubheader, Select, type SelectChangeEvent } from '@elementor/ui';

import { InteractionsPromotionChip, type InteractionsPromotionChipRef } from "./interactions-promotion-chip";

type PromotionSelectProps = {
	value: string;
	onChange?: ( value: string ) => void;
	baseOptions: Record< string, string >;
	extendedOptions: Record< string, string >;
	proLabel: string;
	proContent: string;
	upgradeUrl: string;
};

export function PromotionSelect( {
	value,
	onChange,
	baseOptions,
	extendedOptions,
	proLabel,
	proContent,
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
				{ proLabel }
				<InteractionsPromotionChip
					content={ proContent }
					upgradeUrl={ upgradeUrl }
					ref={ promotionRef }
					anchorRef={ anchorRef }
				/>
			</MenuSubheader>

			{ Object.entries( extendedOptions ).map( ( [ key, label ] ) => (
				<MenuListItem key={ key } value={ key } disabled sx={ { pl: 3 } }>
					{ label }
				</MenuListItem>
			) ) }
		</Select>
	);
}
