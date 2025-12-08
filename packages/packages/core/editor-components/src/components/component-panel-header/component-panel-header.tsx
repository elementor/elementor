import * as React from 'react';
import { getV1DocumentsManager } from '@elementor/editor-documents';
import { ArrowLeftIcon, ComponentsIcon } from '@elementor/icons';
import { __useSelector as useSelector } from '@elementor/store';
import { Box, Divider, IconButton, Stack, Tooltip, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useNavigateBack } from '../../hooks/use-navigate-back';
import { selectCurrentComponentId } from '../../store/store';
import { ComponentsBadge } from './component-badge';
import { useOverridableProps } from './use-overridable-props';

export const ComponentPanelHeader = () => {
	const currentComponentId = useSelector( selectCurrentComponentId );
	const overridableProps = useOverridableProps( currentComponentId );
	const onBack = useNavigateBack();
	const componentName = getComponentName();

	const overridesCount = overridableProps ? Object.keys( overridableProps.props ).length : 0;

	if ( ! currentComponentId ) {
		return null;
	}

	return (
		<Box>
			<Stack
				direction="row"
				alignItems="center"
				justifyContent="space-between"
				sx={ { height: 48, pl: 1.5, pr: 2, py: 1 } }
			>
				<Stack direction="row" alignItems="center" gap={ 0.5 }>
					<Tooltip title={ __( 'Back', 'elementor' ) }>
						<IconButton size="tiny" onClick={ onBack } aria-label={ __( 'Back', 'elementor' ) }>
							<ArrowLeftIcon />
						</IconButton>
					</Tooltip>
					<Stack direction="row" alignItems="center" gap={ 0.5 }>
						<ComponentsIcon color="secondary" fontSize="tiny" />
						<Typography variant="caption" sx={ { fontWeight: 500 } }>
							{ componentName }
						</Typography>
					</Stack>
				</Stack>
				<ComponentsBadge overridesCount={ overridesCount } />
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
