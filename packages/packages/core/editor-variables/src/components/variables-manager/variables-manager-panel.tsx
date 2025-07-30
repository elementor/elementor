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
import { FilterIcon, XIcon } from '@elementor/icons';
import { Alert, Box, Button, Divider, ErrorBoundary, IconButton, type IconButtonProps, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import { useDirtyState } from '../../../../editor-global-classes/src/hooks/use-dirty-state';

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

	usePreventUnload();

	return (
		<ThemeProvider>
			<ErrorBoundary fallback={ <ErrorBoundaryFallback /> }>
				<Panel>
					<PanelHeader>
						<Stack p={ 1 } pl={ 2 } width="100%" direction="row" alignItems="center">
							<Stack width="100%" direction="row" gap={ 1 }>
								<PanelHeaderTitle sx={ { display: 'flex', alignItems: 'center', gap: 0.5 } }>
									<FilterIcon fontSize="inherit" />
									{ __( 'Variables Manager', 'elementor' ) }
								</PanelHeaderTitle>
							</Stack>
							<CloseButton
								sx={ { marginLeft: 'auto' } }
								onClose={ () => {
									closePanel();
								} }
							/>
						</Stack>
					</PanelHeader>
					<PanelBody
						sx={ {
							display: 'flex',
							flexDirection: 'column',
							height: '100%',
						} }
					>
						<Divider />
						<Box
							px={ 2 }
							sx={ {
								flexGrow: 1,
								overflowY: 'auto',
							} }
						>
							List
						</Box>
					</PanelBody>

					<PanelFooter>
						<Button fullWidth size="small" color="global" variant="contained">
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

const usePreventUnload = () => {
	const isDirty = useDirtyState();

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