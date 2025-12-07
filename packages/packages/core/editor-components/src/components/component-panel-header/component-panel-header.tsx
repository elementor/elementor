import * as React from 'react';
import { useEffect, useRef } from 'react';
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
	0% { transform: scale(0) translate(50%, 50%); opacity: 0; }
	70% { transform: scale(1.1) translate(50%, -50%); opacity: 1; }
	100% { transform: scale(1) translate(50%, -50%); opacity: 1; }
`;
const slideUp = keyframes`
	from { transform: translateY(100%); opacity: 0; }
	to { transform: translateY(0); opacity: 1; }
`;

export const ComponentPanelHeader = () => {
	const { path, currentComponentId } = useCurrentComponent();
	const overridableProps = useOverridableProps( currentComponentId );
	const onBack = useNavigateBack( path );
	const prevCountRef = useRef( 0 );

	const componentName = getComponentName();
	const overridesCount = overridableProps ? Object.keys( overridableProps.props ).length : 0;
	const isFirstOverride = prevCountRef.current === 0 && overridesCount === 1;

	useEffect( () => {
		prevCountRef.current = overridesCount;
	}, [ overridesCount ] );

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
				<Badge
					key={ overridesCount }
					invisible={ overridesCount === 0 }
					badgeContent={
						<StyledBadgeContent shouldAnimate={ ! isFirstOverride }>{ overridesCount }</StyledBadgeContent>
					}
					color="primary"
					anchorOrigin={ { vertical: 'top', horizontal: 'right' } }
					sx={ {
						'& .MuiBadge-badge': {
							minWidth: 16,
							height: 16,
							minHeight: 16,
							maxWidth: 16,
							fontSize: 10,
							transformOrigin: '100% 0%',
							transition: 'none',
							animation: isFirstOverride ? `${ bounceIn } 300ms ease-out` : 'none',
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

const StyledBadgeContent = styled( 'span' )< { shouldAnimate: boolean } >( ( { shouldAnimate } ) => ( {
	animation: shouldAnimate ? `${ slideUp } 300ms ease-out` : 'none',
} ) );
