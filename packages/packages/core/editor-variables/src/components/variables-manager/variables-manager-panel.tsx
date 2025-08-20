import * as React from 'react';
import { useEffect } from 'react';
import {
	__createPanel as createPanel,
	Panel,
	PanelBody,
	PanelFooter,
	PanelHeader,
	PanelHeaderTitle,
} from '@elementor/editor-panels';
import { ThemeProvider } from '@elementor/editor-ui';
import { changeEditMode } from '@elementor/editor-v1-adapters';
import { ColorFilterIcon, TrashIcon, XIcon } from '@elementor/icons';
import { Alert, Box, Button, Divider, ErrorBoundary, IconButton, type IconButtonProps, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { getVariables } from '../../hooks/use-prop-variables';
import { VariablesManagerTable } from './variables-manager-table';

const id = 'variables-manager';

export const { panel, usePanelActions } = createPanel( {
	id,
	component: VariablesManagerPanel,
	allowedEditModes: [ 'edit', id ],
	onOpen: () => {
		changeEditMode( id );
	},
	onClose: () => {
		changeEditMode( 'edit' );
	},
} );

export function VariablesManagerPanel() {
	const { close: closePanel } = usePanelActions();
	const isDirty = false;
	const variables = getVariables( false );

	usePreventUnload( isDirty );

	const menuActions = [
		{
			name: __( 'Delete', 'elementor' ),
			icon: TrashIcon,
			color: 'error.main',
			onClick: () => {},
		},
	];

	return (
		<ThemeProvider>
			<ErrorBoundary fallback={ <ErrorBoundaryFallback /> }>
				<Panel>
					<PanelHeader>
						<Stack width="100%" direction="column" alignItems="center">
							<Stack p={ 1 } pl={ 2 } width="100%" direction="row" alignItems="center">
								<Stack width="100%" direction="row" gap={ 1 }>
									<PanelHeaderTitle sx={ { display: 'flex', alignItems: 'center', gap: 0.5 } }>
										<ColorFilterIcon fontSize="inherit" />
										{ __( 'Variable Manager', 'elementor' ) }
									</PanelHeaderTitle>
								</Stack>
								<CloseButton
									sx={ { marginLeft: 'auto' } }
									onClose={ () => {
										closePanel();
									} }
								/>
							</Stack>
							<Divider sx={ { width: '100%' } } />
						</Stack>
					</PanelHeader>
					<PanelBody
						sx={ {
							display: 'flex',
							flexDirection: 'column',
							height: '100%',
						} }
					>
						<VariablesManagerTable menuActions={ menuActions } variables={ variables } />
					</PanelBody>

					<PanelFooter>
						<Button fullWidth size="small" color="global" variant="contained" disabled={ ! isDirty }>
							{ __( 'Save changes', 'elementor' ) }
						</Button>
					</PanelFooter>
				</Panel>
			</ErrorBoundary>
		</ThemeProvider>
	);
}

const CloseButton = ( { onClose, ...props }: IconButtonProps & { onClose: () => void } ) => (
	<IconButton size="small" color="secondary" onClick={ onClose } aria-label="Close" { ...props }>
		<XIcon fontSize="small" />
	</IconButton>
);

const ErrorBoundaryFallback = () => (
	<Box role="alert" sx={ { minHeight: '100%', p: 2 } }>
		<Alert severity="error" sx={ { mb: 2, maxWidth: 400, textAlign: 'center' } }>
			<strong>{ __( 'Something went wrong', 'elementor' ) }</strong>
		</Alert>
	</Box>
);

const usePreventUnload = ( isDirty: boolean ) => {
	useEffect( () => {
		const handleBeforeUnload = ( event: BeforeUnloadEvent ) => {
			if ( isDirty ) {
				event.preventDefault();
			}
		};

		window.addEventListener( 'beforeunload', handleBeforeUnload );

		return () => {
			window.removeEventListener( 'beforeunload', handleBeforeUnload );
		};
	}, [ isDirty ] );
};
