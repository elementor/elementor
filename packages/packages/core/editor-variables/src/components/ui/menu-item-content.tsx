import * as React from 'react';
import { EllipsisWithTooltip, type VirtualizedItem } from '@elementor/editor-ui';
import { EditIcon } from '@elementor/icons';
import { Box, IconButton, ListItemIcon, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

const SIZE = 'tiny';

export const MenuItemContent = < T, V extends string >( { item }: { item: VirtualizedItem< T, V > } ) => {
	const onEdit = item.onEdit as ( ( value: V ) => void ) | undefined;

	return (
		<>
			<ListItemIcon>{ item.icon }</ListItemIcon>
			<Box
				sx={ {
					flex: 1,
					minWidth: 0,
					display: 'flex',
					alignItems: 'center',
					gap: 1,
				} }
			>
				<EllipsisWithTooltip
					title={ item.label || item.value }
					as={ Typography }
					variant="caption"
					color="text.primary"
					sx={ { marginTop: '1px', lineHeight: '2' } }
					maxWidth="50%"
				/>
				{ item.secondaryText && (
					<EllipsisWithTooltip
						title={ item.secondaryText }
						as={ Typography }
						variant="caption"
						color="text.tertiary"
						sx={ { marginTop: '1px', lineHeight: '1' } }
						maxWidth="50%"
					/>
				) }
			</Box>
			{ !! onEdit && (
				<IconButton
					sx={ { mx: 1, opacity: '0' } }
					onClick={ ( e: React.MouseEvent< HTMLButtonElement > ) => {
						e.stopPropagation();
						onEdit( item.value );
					} }
					aria-label={ __( 'Edit', 'elementor' ) }
				>
					<EditIcon color="action" fontSize={ SIZE } />
				</IconButton>
			) }
		</>
	);
};
