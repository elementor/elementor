import * as React from 'react';
import { getV1DocumentsManager } from '@elementor/editor-documents';
import { ArrowLeftIcon, ComponentsIcon, SettingsIcon } from '@elementor/icons';
import {
	Badge,
	Box,
	Divider,
	IconButton,
	keyframes,
	Stack,
	styled,
	ToggleButton,
	Tooltip,
	Typography,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useCurrentComponent, useNavigateBack } from '../edit-component/edit-component';
import { useOverridableProps } from './use-overridable-props';

const bounceIn = keyframes`
	0% { transform: scale(0); }
	70% { transform: scale(1.1); }
	100% { transform: scale(1); }
`;

const slideUp = keyframes`
	from { transform: translateY(100%); opacity: 0; }
	to { transform: translateY(0); opacity: 1; }
`;

export const ComponentPanelHeader = () => {
	const { path, currentComponentId } = useCurrentComponent();
	const overridableProps = useOverridableProps( currentComponentId );
	const onBack = useNavigateBack( path );

	if ( ! currentComponentId ) {
		return null;
	}

	const componentName = getComponentName();
	const overridesCount = overridableProps ? Object.keys( overridableProps.props ).length : 0;

	return (
		<Box>
			<Stack
				direction="row"
				alignItems="center"
				justifyContent="space-between"
				sx={ { height: 44, pl: 1.5, pr: 2, py: 1 } }
			>
				<Stack direction="row" alignItems="center" gap={ 1 }>
					<Stack direction="row" alignItems="center" gap={ 0.5 }>
						<Tooltip title={ __( 'Back', 'elementor' ) }>
							<IconButton size="tiny" onClick={ onBack } aria-label={ __( 'Back', 'elementor' ) }>
								<ArrowLeftIcon fontSize="tiny" />
							</IconButton>
						</Tooltip>
						<Stack direction="row" alignItems="center" gap={ 0.5 }>
							<ComponentsIcon sx={ { fontSize: 12, color: 'text.primary' } } />
							<Typography
								variant="caption"
								fontWeight={ 500 }
								sx={ {
									maxWidth: 100,
									overflow: 'hidden',
									textOverflow: 'ellipsis',
									whiteSpace: 'nowrap',
									color: 'text.primary',
									letterSpacing: '0.1px',
								} }
							>
								{ componentName }
							</Typography>
						</Stack>
					</Stack>
				</Stack>
				<Badge
					key={ overridesCount }
					invisible={ overridesCount === 0 }
					badgeContent={ <StyledBadgeContent>{ overridesCount }</StyledBadgeContent> }
					color="primary"
					anchorOrigin={ { vertical: 'top', horizontal: 'right' } }
					sx={ {
						'& .MuiBadge-badge': {
							minWidth: 16,
							height: 16,
							minHeight: 16,
						},
					} }
				>
					<ToggleButton value="overrides" size="tiny" aria-label={ __( 'View overrides', 'elementor' ) }>
						<SettingsIcon fontSize="tiny" />
					</ToggleButton>
				</Badge>
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

const StyledBadgeContent = styled( 'span' )( {
	animation: `${ bounceIn } 300ms ease-out, ${ slideUp } 300ms ease-out`,
} );
