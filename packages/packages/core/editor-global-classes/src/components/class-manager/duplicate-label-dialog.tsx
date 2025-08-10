import * as React from 'react';
import { type ModifiedLabel } from '@elementor/editor-styles';
import { EllipsisWithTooltip } from '@elementor/editor-ui';
import { __dispatch } from '@elementor/store';
import { Alert, Box, Divider, Stack, styled, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { slice } from '../../store';

export const DuplicateLabelDialog = ( { modifiedLabels }: { modifiedLabels: ModifiedLabel[] } ) => {
	React.useEffect( () => {
		__dispatch( slice.actions.updateMultiple( modifiedLabels ) );
	}, [ modifiedLabels ] );

	return (
		<Stack spacing={ 2 } direction="column">
			<Typography variant="body1">
				{ __(
					'Some of the classes you created had the same names as existing ones on your site. To avoid conflicts, we renamed them by adding the suffix',
					'elementor'
				) }
			</Typography>

			<Box>
				<StyledBox>
					<Typography variant="subtitle2" sx={ { fontWeight: 'bold' } }>
						{ __( 'Before', 'elementor' ) }
					</Typography>
					<Typography sx={ { minWidth: '200px', fontWeight: 'bold' } } variant="subtitle2">
						{ __( 'After', 'elementor' ) }
					</Typography>
				</StyledBox>
				<Divider sx={ { pt: 0.5, pb: 0.5 } } />

				{ modifiedLabels.map( ( { original, modified, item_id: id } ) => (
					<StyledBox key={ id }>
						<Box sx={ { flex: 1 } }>
							<EllipsisWithTooltip title={ original }>
								<Typography variant="body2" sx={ { color: 'text.secondary' } }>
									{ original }
								</Typography>
							</EllipsisWithTooltip>
						</Box>
						<Box sx={ { minWidth: '200px' } }>
							<EllipsisWithTooltip title={ modified }>
								<Typography variant="body2" sx={ { color: 'text.primary' } }>
									{ modified }
								</Typography>
							</EllipsisWithTooltip>
						</Box>
					</StyledBox>
				) ) }
				<Box sx={ { pt: 1 } }>
					<Alert severity="info">
						{ __(
							`You can quickly find them in Class Manager by searching for that prefix.Your designs are safe - nothing was lost, only renamed to prevent issues.`,
							'elementor'
						) }
					</Alert>
				</Box>
			</Box>
		</Stack>
	);
};

const StyledBox = styled( Box )`
	width: 100%;
	display: flex;
	gap: 16px;
	align-items: flex-start;

	> *:first-child {
		flex: 1;
		flex-shrink: 1;
		flex-grow: 1;
		min-width: 0;
	}

	> *:last-child {
		flex-shrink: 0;
		flex-grow: 0;
		width: 200px;
		max-width: 200px;
	}
`;
