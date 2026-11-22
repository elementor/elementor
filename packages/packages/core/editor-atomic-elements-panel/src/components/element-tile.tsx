import * as React from 'react';
import { CrownIcon, WidgetsIcon } from '@elementor/icons';
import { ButtonBase, Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type ElementTile as ElementTileData } from '../utils/group-widgets';

const ICON_SIZE = 28;

const TITLE_SX = {
	maxWidth: '100%',
	textAlign: 'center',
	'&.MuiTypography-root': { fontSize: 11, letterSpacing: 0 },
};

const CROWN_SX = {
	position: 'absolute',
	top: 6,
	insetInlineEnd: 6,
};

export function ElementTile( { tile, groupId }: { tile: ElementTileData; groupId: string } ) {
	const isLocked = !! tile.promotionType;

	const openPromotion = ( event: React.MouseEvent< HTMLElement > ) => {
		document.dispatchEvent(
			new CustomEvent( `${ tile.promotionType }-promotion:open`, {
				detail: { target: event.currentTarget, title: tile.title },
			} )
		);
	};

	return (
		<ButtonBase
			onClick={ isLocked ? openPromotion : undefined }
			data-nav-item="tile"
			data-group-id={ groupId }
			data-el-type={ tile.elType }
			data-widget-type={ tile.widgetType }
			sx={ {
				flexDirection: 'column',
				justifyContent: 'flex-start',
				minWidth: 0,
				gap: 0.5,
				p: 0.5,
				borderRadius: 1,
				'&.Mui-focusVisible': { outline: '2px solid', outlineColor: 'primary.main' },
			} }
		>
			<Stack
				alignItems="center"
				justifyContent="center"
				sx={ {
					position: 'relative',
					width: '100%',
					height: 72,
					borderRadius: 1,
					backgroundColor: 'action.hover',
				} }
			>
				{ isLocked && (
					<CrownIcon
						fontSize="tiny"
						color="promotion"
						sx={ CROWN_SX }
						titleAccess={ __( 'Upgrade', 'elementor' ) }
					/>
				) }
				{ tile.icon ? (
					<i className={ tile.icon } aria-hidden="true" style={ { fontSize: ICON_SIZE } } />
				) : (
					<WidgetsIcon sx={ { fontSize: ICON_SIZE } } />
				) }
			</Stack>
			<Typography variant="caption" color="text.secondary" sx={ TITLE_SX }>
				{ tile.title }
			</Typography>
		</ButtonBase>
	);
}
