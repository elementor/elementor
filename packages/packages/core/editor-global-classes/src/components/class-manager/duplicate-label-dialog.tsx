import * as React from 'react';
import { type ModifiedLabel } from '@elementor/editor-styles';
import { EllipsisWithTooltip } from '@elementor/editor-ui';
import { __dispatch } from '@elementor/store';
import { Alert, Box, Divider, Stack, styled, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { slice } from '../../store';
const DUP_PREFIX = 'DUP_';

export const DuplicateLabelDialog = ( { modifiedLabels }: { modifiedLabels: ModifiedLabel[] } ) => {
	React.useEffect( () => {
		__dispatch( slice.actions.updateMultiple( modifiedLabels ) );
	}, [ modifiedLabels ] );


	return (
		<Stack spacing={ 2 } direction="column">
			<Typography variant="body2" sx={{ pb: 2 }}>
				
				{ __(
					'Some new classes used the same names as existing ones. To prevent conflicts, we added the prefix ',
					'elementor'
				)}
							<strong>{ DUP_PREFIX }</strong>
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
				<Divider sx={ { mt: 0.5, mb: 0.5 } } />
				<Stack direction="column" gap={ 0.5 } sx={ { pb: 2 } }>
					{ modifiedLabels.map( ( { original, modified, id } ) => (
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
				</Stack>
				<Box >
					<Alert severity="info" size="small" color="secondary" >
							<strong>{ __('Your designs and classes are safe.','elementor') }</strong>
							{ __('Only the prefixes were added.Find them in Class Manager by searching ','elementor')}
							<strong>{ DUP_PREFIX }</strong>
						
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

	> *:first-of-type {
		flex: 1;
		flex-shrink: 1;
		flex-grow: 1;
		min-width: 0;
	}

	> *:last-of-type {
		flex-shrink: 0;
		flex-grow: 0;
		width: 200px;
		max-width: 200px;
	}
`;
