import { ArrowRightIcon, CopyIcon, XIcon } from '@elementor/icons';
import Box from '@elementor/ui/Box';
import Button from '@elementor/ui/Button';
import Dialog from '@elementor/ui/Dialog';
import IconButton from '@elementor/ui/IconButton';
import Stack from '@elementor/ui/Stack';
import Typography from '@elementor/ui/Typography';
import { __, sprintf } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import { FIX_WITH_ANGIE } from '../scanner-constants';
import { copyPromptText } from './fix-row-actions';

const WP_ADMIN_BAR_Z_INDEX = 99999;
const DIALOG_Z_INDEX = WP_ADMIN_BAR_Z_INDEX + 1;
const DIALOG_WIDTH = 647;
const STEP_BADGE_SIZE = 24;
const PROMPT_MIN_HEIGHT = 120;

const getPromptChecks = ( checks ) => checks.filter( ( check ) => FIX_WITH_ANGIE === check.fixWith && check.fixPrompt );

const StepBadge = ( { number } ) => (
	<Box
		width={ STEP_BADGE_SIZE }
		height={ STEP_BADGE_SIZE }
		borderRadius="50%"
		bgcolor="action.hover"
		display="flex"
		alignItems="center"
		justifyContent="center"
		flexShrink={ 0 }
	>
		<Typography variant="caption" color="text.secondary">{ number }</Typography>
	</Box>
);

StepBadge.propTypes = {
	number: PropTypes.number.isRequired,
};

export const HowToFixDialog = ( { checks, checkId, onClose, onShowCheck } ) => {
	const promptChecks = getPromptChecks( checks );
	const index = promptChecks.findIndex( ( check ) => check.id === checkId );
	const check = promptChecks[ index ];

	if ( ! check ) {
		return null;
	}

	const isLast = index === promptChecks.length - 1;

	return (
		<Dialog
			open
			onClose={ onClose }
			sx={ { zIndex: DIALOG_Z_INDEX } }
			PaperProps={ {
				sx: {
					width: DIALOG_WIDTH,
					maxWidth: 'calc(100% - 32px)',
					m: 0,
				},
			} }
		>
			<Stack direction="row" alignItems="flex-start" justifyContent="space-between" px={ 3 } pt={ 1.5 } pb={ 2 }>
				<Stack spacing={ 0 } minWidth={ 0 }>
					<Typography variant="overline" color="text.tertiary">{ __( 'How to fix', 'elementor' ) }</Typography>
					<Typography variant="h5" component="h2" color="text.primary">{ check.title }</Typography>
				</Stack>
				<IconButton aria-label={ __( 'Close', 'elementor' ) } onClick={ onClose }>
					<XIcon />
				</IconButton>
			</Stack>
			<Stack spacing={ 2 } px={ 3 } pb={ 2.5 }>
				<Stack spacing={ 1 }>
					<Stack direction="row" spacing={ 1 } alignItems="center">
						<StepBadge number={ 1 } />
						<Typography variant="subtitle2">{ __( 'Copy the prompt', 'elementor' ) }</Typography>
					</Stack>
					<Stack spacing={ 1 } bgcolor="action.hover" borderRadius={ 1.5 } px={ 2 } pt={ 2 } pb={ 1 } minHeight={ PROMPT_MIN_HEIGHT } justifyContent="flex-end">
						<Typography variant="body2" color="text.tertiary" sx={ { fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre-wrap' } }>
							{ check.fixPrompt }
						</Typography>
						<Stack direction="row" justifyContent="flex-end">
							<Button
								variant="contained"
								color="primary"
								size="small"
								startIcon={ <CopyIcon fontSize="tiny" /> }
								onClick={ () => copyPromptText( check.fixPrompt ) }
							>
								{ __( 'Copy prompt', 'elementor' ) }
							</Button>
						</Stack>
					</Stack>
				</Stack>
				<Stack direction="row" spacing={ 1 } alignItems="flex-start">
					<StepBadge number={ 2 } />
					<Typography variant="subtitle2">
						{ __( 'Paste it into your AI assistant. If it\'s connected to your site, it can make the fix. If not, it will walk you through it.', 'elementor' ) }
					</Typography>
				</Stack>
				<Stack direction="row" spacing={ 1 } alignItems="center">
					<StepBadge number={ 3 } />
					<Typography variant="subtitle2">{ __( 'Scan again when you\'re done', 'elementor' ) }</Typography>
				</Stack>
			</Stack>
			<Stack direction="row" alignItems="center" justifyContent="space-between" px={ 3 } py={ 2 } borderTop={ 1 } borderColor="divider">
				<Button variant="text" color="secondary" onClick={ onClose }>
					{ __( 'Skip', 'elementor' ) }
				</Button>
				<Stack direction="row" spacing={ 1 } alignItems="center">
					<Typography variant="body2" color="text.secondary">
						{ sprintf(
							/* Translators: 1: current prompt number, 2: number of prompts. */
							__( '%1$d of %2$d', 'elementor' ),
							index + 1,
							promptChecks.length,
						) }
					</Typography>
					<Button
						variant="outlined"
						color="primary"
						endIcon={ <ArrowRightIcon fontSize="tiny" /> }
						disabled={ isLast }
						onClick={ () => {
							const nextCheck = promptChecks[ index + 1 ];

							if ( nextCheck ) {
								onShowCheck( nextCheck.id );
							}
						} }
					>
						{ __( 'Next issue', 'elementor' ) }
					</Button>
				</Stack>
			</Stack>
		</Dialog>
	);
};

HowToFixDialog.propTypes = {
	checks: PropTypes.arrayOf( PropTypes.object ).isRequired,
	checkId: PropTypes.string,
	onClose: PropTypes.func.isRequired,
	onShowCheck: PropTypes.func.isRequired,
};
