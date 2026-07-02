import * as React from 'react';
import { type MouseEvent } from 'react';
import { EllipsisWithTooltip, type VirtualizedItem } from '@elementor/editor-ui';
import { EditIcon } from '@elementor/icons';
import { Box, IconButton, ListItemIcon, Tooltip, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

const SIZE = 'tiny';
const EDIT_LABEL = __( 'Edit variable', 'elementor' );

type MenuItemContentProps< T, V extends string > = {
	item: VirtualizedItem< T, V >;
	disabled?: boolean;
};

export const MenuItemContent = < T, V extends string >( { item, disabled = false }: MenuItemContentProps< T, V > ) => {
	const onEdit = item.onEdit as ( ( value: V ) => void ) | undefined;

	return (
		<>
			<ListItemIcon sx={ { color: disabled ? 'text.disabled' : 'inherit' } }>{ item.icon }</ListItemIcon>
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
					color={ disabled ? 'text.disabled' : 'text.primary' }
					sx={ { marginTop: '1px', lineHeight: '2' } }
					maxWidth="50%"
				/>
				{ item.secondaryText && (
					<EllipsisWithTooltip
						title={ item.secondaryText }
						as={ Typography }
						variant="caption"
						color={ disabled ? 'text.disabled' : 'text.tertiary' }
						sx={ { marginTop: '1px', lineHeight: '1' } }
						maxWidth="50%"
					/>
				) }
			</Box>
			{ !! onEdit && ! disabled && (
				<Tooltip placement="top" title={ EDIT_LABEL }>
					<IconButton
						sx={ { mx: 1, opacity: '0' } }
						onClick={ ( e: MouseEvent< HTMLButtonElement > ) => {
							e.stopPropagation();
							onEdit( item.value );
						} }
						aria-label={ EDIT_LABEL }
					>
						<EditIcon color="action" fontSize={ SIZE } />
					</IconButton>
				</Tooltip>
			) }
		</>
	);
};
