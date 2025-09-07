import * as React from 'react';
import { closeDialog, EllipsisWithTooltip } from '@elementor/editor-ui';
import { InfoCircleFilledIcon } from '@elementor/icons';
import {
	Alert,
	Box,
	Button,
	DialogActions,
	DialogContent,
	DialogHeader,
	Divider,
	Icon,
	Stack,
	Typography,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type ModifiedLabels } from '../../store';

const DUP_PREFIX = 'DUP_';

export const DuplicateLabelDialog = ( {
	modifiedLabels,
	onApprove,
}: {
	modifiedLabels: ModifiedLabels;
	onApprove?: () => void;
} ) => {
	const handleButtonClick = () => {
		localStorage.setItem( 'elementor-global-classes-search', DUP_PREFIX );
		onApprove?.();
		closeDialog();
	};

	return (
		<>
			<DialogHeader logo={ false }>
				<Box display="flex" alignItems="center" gap={ 1 }>
					<Icon color="secondary">
						<InfoCircleFilledIcon fontSize="medium" />
					</Icon>
					<Typography variant="subtitle1">
						{ __( "We've published your page and updated class names.", 'elementor' ) }
					</Typography>
				</Box>
			</DialogHeader>
			<DialogContent>
				<Stack spacing={ 2 } direction="column">
					<Typography variant="body2">
						{ __(
							'Some new classes used the same names as existing ones. To prevent conflicts, we added the prefix',
							'elementor'
						) }
						<strong> { DUP_PREFIX }</strong>
					</Typography>

					<Box>
						<Box
							sx={ {
								width: '100%',
								display: 'flex',
								gap: 2,
								alignItems: 'flex-start',
							} }
						>
							<Typography
								variant="subtitle2"
								sx={ {
									fontWeight: 'bold',
									flex: 1,
									flexShrink: 1,
									flexGrow: 1,
									minWidth: 0,
								} }
							>
								{ __( 'Before', 'elementor' ) }
							</Typography>
							<Typography
								variant="subtitle2"
								sx={ {
									minWidth: '200px',
									fontWeight: 'bold',
									flexShrink: 0,
									flexGrow: 0,
									width: '200px',
									maxWidth: '200px',
								} }
							>
								{ __( 'After', 'elementor' ) }
							</Typography>
						</Box>
						<Divider sx={ { mt: 0.5, mb: 0.5 } } />
						<Stack direction="column" gap={ 0.5 } sx={ { pb: 2 } }>
							{ Object.values( modifiedLabels ).map( ( { original, modified }, index ) => (
								<Box
									key={ index }
									sx={ {
										width: '100%',
										display: 'flex',
										gap: 2,
										alignItems: 'flex-start',
									} }
								>
									<Box
										sx={ {
											flex: 1,
											flexShrink: 1,
											flexGrow: 1,
											minWidth: 0,
										} }
									>
										<EllipsisWithTooltip title={ original }>
											<Typography variant="body2" sx={ { color: 'text.secondary' } }>
												{ original }
											</Typography>
										</EllipsisWithTooltip>
									</Box>
									<Box
										sx={ {
											minWidth: '200px',
											flexShrink: 0,
											flexGrow: 0,
											width: '200px',
											maxWidth: '200px',
										} }
									>
										<EllipsisWithTooltip title={ modified }>
											<Typography variant="body2" sx={ { color: 'text.primary' } }>
												{ modified }
											</Typography>
										</EllipsisWithTooltip>
									</Box>
								</Box>
							) ) }
						</Stack>
						<Box>
							<Alert severity="info" size="small" color="secondary">
								<strong>{ __( 'Your designs and classes are safe.', 'elementor' ) }</strong>
								{ __(
									'Only the prefixes were added.Find them in Class Manager by searching',
									'elementor'
								) }
								<strong>{ DUP_PREFIX }</strong>
							</Alert>
						</Box>
					</Box>
				</Stack>
			</DialogContent>
			<DialogActions>
				<Button color="secondary" variant="text" onClick={ handleButtonClick }>
					{ __( 'Go to Class Manager', 'elementor' ) }
				</Button>
				<Button color="secondary" variant="contained" onClick={ closeDialog }>
					{ __( 'Done', 'elementor' ) }
				</Button>
			</DialogActions>
		</>
	);
};
