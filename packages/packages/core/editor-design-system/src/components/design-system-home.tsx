import * as React from 'react';
import { ChevronRightIcon, ColorFilterIcon, ColorSwatchIcon, TextIcon } from '@elementor/icons';
import { Box, Chip, Rotate, Stack, Typography, useTheme } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type DesignSystemTab } from '../initial-tab';
import { onKeyboardClick } from '../utils/keyboard-click';

type HomeItem = {
	tab: DesignSystemTab;
	title: string;
	description: string;
	icon: React.ReactElement;
};

const HOME_ITEMS: HomeItem[] = [
	{
		tab: 'variables',
		title: __( 'Variables', 'elementor' ),
		description: __( 'Colors, fonts & sizes', 'elementor' ),
		icon: <ColorFilterIcon fontSize="small" color="action" />,
	},
	{
		tab: 'classes',
		title: __( 'Classes', 'elementor' ),
		description: __( 'Reusable styles', 'elementor' ),
		icon: <ColorSwatchIcon fontSize="small" color="action" />,
	},
	{
		tab: 'defaults',
		title: __( 'Default styles', 'elementor' ),
		description: __( 'HTML tags', 'elementor' ),
		icon: <TextIcon fontSize="small" color="action" />,
	},
];

export type DesignSystemHomeProps = {
	onSelect: ( tab: DesignSystemTab ) => void;
};

export function DesignSystemHome( { onSelect }: DesignSystemHomeProps ) {
	const isRtl = 'rtl' === useTheme().direction;

	return (
		<Stack
			role="list"
			aria-label={ __( 'Design system sections', 'elementor' ) }
			sx={ {
				flex: 1,
				minHeight: 0,
				overflow: 'auto',
				px: 2,
				py: 1.5,
				gap: 1,
			} }
		>
			{ HOME_ITEMS.map( ( item ) => (
				<Box
					key={ item.tab }
					role="listitem"
				>
					<HomeRow
						{ ...item }
						isRtl={ isRtl }
						onSelect={ () => onSelect( item.tab ) }
					/>
				</Box>
			) ) }
		</Stack>
	);
}

type HomeRowProps = HomeItem & {
	isRtl: boolean;
	onSelect: () => void;
};

function HomeRow( { title, description, icon, isRtl, onSelect }: HomeRowProps ) {
	return (
		<Box
			role="button"
			tabIndex={ 0 }
			aria-label={ title }
			onClick={ onSelect }
			onKeyDown={ onKeyboardClick( onSelect ) }
			sx={ {
				display: 'flex',
				alignItems: 'center',
				gap: 1.5,
				px: 1.5,
				py: 1.25,
				cursor: 'pointer',
				borderRadius: 1,
				border: 1,
				borderColor: 'divider',
				'&:hover': { bgcolor: 'action.hover' },
				outline: 'none',
				'&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' },
			} }
		>
			{ icon }
			<Stack sx={ { flex: 1, minWidth: 0 } }>
				<Typography variant="body2" fontWeight="bold">
					{ title }
				</Typography>
				<Typography variant="caption" color="text.secondary">
					{ description }
				</Typography>
			</Stack>
			<Chip label="0" size="small" variant="filled" sx={ { bgcolor: 'action.selected', fontWeight: 'bold' } } />
			<Rotate in={ isRtl }>
				<ChevronRightIcon fontSize="small" color="action" />
			</Rotate>
		</Box>
	);
}