import * as React from 'react';
import { getV1DocumentsManager } from '@elementor/editor-documents';
import { ArrowLeftIcon, ComponentsFilledIcon } from '@elementor/icons';
import { __useSelector as useSelector } from '@elementor/store';
import { Box, Divider, IconButton, Stack, Tooltip, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useNavigateBack } from '../../hooks/use-navigate-back';
import { selectCurrentComponentId } from '../../store/store';
import { usePanelActions } from '../component-properties-panel/component-properties-panel-panel';
import { ComponentsBadge } from './component-badge';
import { useOverridableProps } from './use-overridable-props';

export const ComponentPanelHeader = () => {
	const currentComponentId = useSelector( selectCurrentComponentId );
	const overridableProps = useOverridableProps( currentComponentId );
	const onBack = useNavigateBack();
	const componentName = getComponentName();

	const { open: openPropertiesPanel } = usePanelActions();

	const overridesCount = overridableProps ? Object.keys( overridableProps.props ).length : 0;

	if ( ! currentComponentId ) {
		return null;
	}

	const handleClick = () => {
		openPropertiesPanel();
	};

	return (
		<Box>
			<Stack
				direction="row"
				alignItems="center"
				justifyContent="space-between"
				sx={ { height: 48, pl: 1.5, pr: 2, py: 1 } }
			>
				<Stack direction="row" alignItems="center">
					<Tooltip title={ __( 'Back', 'elementor' ) }>
						<IconButton size="tiny" onClick={ onBack } aria-label={ __( 'Back', 'elementor' ) }>
							<ArrowLeftIcon fontSize="tiny" />
						</IconButton>
					</Tooltip>
					<Stack direction="row" alignItems="center" gap={ 0.5 }>
						<ComponentsFilledIcon fontSize="tiny" stroke="currentColor" />
						<Typography variant="caption" sx={ { fontWeight: 500 } }>
							{ componentName }
						</Typography>
					</Stack>
				</Stack>
				<ComponentsBadge overridesCount={ overridesCount } onClick={ handleClick } />
			</Stack>
			<Divider />
		</Box>
	);
};

function getComponentName() {
	const documentsManager = getV1DocumentsManager();
	const currentDocument = documentsManager.getCurrent();

	return currentDocument?.container?.settings?.get( 'post_title' ) ?? '';
}
