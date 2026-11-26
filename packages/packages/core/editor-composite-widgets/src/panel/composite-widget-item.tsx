import * as React from 'react';
import { EllipsisWithTooltip } from '@elementor/editor-ui';
import { ComponentsIcon } from '@elementor/icons';
import { Box, ListItemButton, ListItemIcon, Typography } from '@elementor/ui';

import { type CompositeWidgetDefinition } from '../types';
import { addCompositeWidgetToPage, canInsertCompositeWidgets } from './add-composite-widget-to-page';
import { CompositeWidgetItemMenu } from './composite-widget-item-menu';
import { ICON_COLOR } from './composite-widget-item-styles';
import { endDragCompositeWidget, startDragCompositeWidget } from './drag-composite-widget';
import { useIsDragging } from './use-is-dragging';

type Props = {
	definition: CompositeWidgetDefinition;
};

export function CompositeWidgetItem( { definition }: Props ) {
	const isDragging = useIsDragging();

	const onClick = () => {
		if ( ! isDragging && canInsertCompositeWidgets() ) {
			addCompositeWidgetToPage( definition );
		}
	};

	return (
		<ListItemButton
			draggable
			shape="rounded"
			onDragStart={ ( event: React.DragEvent ) => startDragCompositeWidget( definition, event ) }
			onDragEnd={ endDragCompositeWidget }
			sx={ {
				border: 'solid 1px',
				borderColor: 'divider',
				py: 0.5,
				px: 1,
				display: 'flex',
				width: '100%',
				alignItems: 'center',
				gap: 1,
			} }
		>
			<Box display="flex" alignItems="center" gap={ 1 } minWidth={ 0 } flexGrow={ 1 } onClick={ onClick }>
				<ListItemIcon size="tiny">
					<ComponentsIcon fontSize="tiny" sx={ { color: ICON_COLOR } } />
				</ListItemIcon>
				<Box display="flex" flex={ 1 } minWidth={ 0 } px={ 1 }>
					<EllipsisWithTooltip
						title={ definition.title }
						as={ Typography }
						variant="caption"
						color="text.primary"
					/>
				</Box>
			</Box>
			{ 'site' === definition.source && <CompositeWidgetItemMenu definition={ definition } /> }
		</ListItemButton>
	);
}
