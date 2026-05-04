import * as React from 'react';
import { type ElementType } from 'react';
import { PanelHeader, PanelHeaderTitle } from '@elementor/editor-panels';
import { EllipsisWithTooltip } from '@elementor/editor-ui';
import { ComponentsIcon } from '@elementor/icons';
import { IconButton, Stack, Tooltip } from '@elementor/ui';

type InstancePanelHeaderProps = {
	componentName: string;
	actions?: React.ReactNode;
};

export function InstancePanelHeader( { componentName, actions }: InstancePanelHeaderProps ) {
	return (
		<PanelHeader sx={ { justifyContent: 'start', px: 2 } }>
			<Stack direction="row" alignItems="center" flexGrow={ 1 } gap={ 1 } maxWidth="100%">
				<ComponentsIcon fontSize="small" sx={ { color: 'text.tertiary' } } />
				<EllipsisWithTooltip title={ componentName } as={ PanelHeaderTitle } sx={ { flexGrow: 1 } } />
				{ actions }
			</Stack>
		</PanelHeader>
	);
}

type EditComponentActionProps = {
	label: string;
	onClick?: () => void;
	disabled?: boolean;
	icon: ElementType;
};

export function EditComponentAction( { label, onClick, disabled = false, icon: Icon }: EditComponentActionProps ) {
	return (
		<Tooltip title={ label }>
			<IconButton size="tiny" onClick={ onClick } aria-label={ label } disabled={ disabled }>
				<Icon fontSize="tiny" />
			</IconButton>
		</Tooltip>
	);
}
