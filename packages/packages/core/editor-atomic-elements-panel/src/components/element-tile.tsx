import * as React from 'react';
import { WidgetsIcon } from '@elementor/icons';
import { ButtonBase, Stack, Typography } from '@elementor/ui';

import { type ElementTile as ElementTileData } from '../utils/group-widgets';

const ICON_SIZE = 28;

const TITLE_SX = {
	maxWidth: '100%',
	textAlign: 'center',
	'&.MuiTypography-root': { fontSize: 11, letterSpacing: 0 },
};

export function ElementTile( { tile, groupId }: { tile: ElementTileData; groupId: string } ) {
	return (
		<ButtonBase
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
				sx={ { width: '100%', height: 72, borderRadius: 1, backgroundColor: 'action.hover' } }
			>
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
