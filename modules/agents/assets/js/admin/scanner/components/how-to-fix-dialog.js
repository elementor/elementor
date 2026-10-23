import { ArrowRightIcon, CopyIcon } from '@elementor/icons';
import Box from '@elementor/ui/Box';
import Button from '@elementor/ui/Button';
import Dialog from '@elementor/ui/Dialog';
import DialogActions from '@elementor/ui/DialogActions';
import DialogContent from '@elementor/ui/DialogContent';
import DialogHeader from '@elementor/ui/DialogHeader';
import DialogTitle from '@elementor/ui/DialogTitle';
import Stack from '@elementor/ui/Stack';
import Typography from '@elementor/ui/Typography';
import { __, sprintf } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';

import { FIX_WITH_ANGIE, SCANNER_COLORS } from '../scanner-constants';
import { copyPromptText } from './fix-row-actions';

const WP_ADMIN_BAR_Z_INDEX = 99999;
const DIALOG_Z_INDEX = WP_ADMIN_BAR_Z_INDEX + 1;
const DIALOG_WIDTH = 647;
const DIALOG_RADIUS = 16;
const PROMPT_RADIUS = 12;
const STEP_BADGE_SIZE = 24;
const PROMPT_MIN_HEIGHT = 120;
const PROMPT_MAX_HEIGHT = 280;
const PROMPT_LINE_HEIGHT = '20px';
const COPIED_FEEDBACK_MS = 2000;

const getPromptChecks = ( checks ) => checks.filter( ( check ) => FIX_WITH_ANGIE === check.fixWith && check.fixPrompt );

const StepBadge = ( { number } ) => (
	<Box
		width={ STEP_BADGE_SIZE }
		height={ STEP_BADGE_SIZE }
		borderRadius="50%"
		bgcolor={ SCANNER_COLORS.stepBadge }
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

const CopyPromptAction = ( { prompt } ) => {
	const [ isCopied, setIsCopied ] = useState( false );
	const resetTimer = useRef( null );

	useEffect( () => () => clearTimeout( resetTimer.current ), [] );

	const handleCopy = async () => {
		const copied = await copyPromptText( prompt );

		if ( ! copied ) {
			return;
		}

		setIsCopied( true );
		clearTimeout( resetTimer.current );
		resetTimer.current = setTimeout( () => setIsCopied( false ), COPIED_FEEDBACK_MS );
	};

	return (
		<Button
			variant="text"
			color="primary"
			size="small"
			startIcon={ <CopyIcon fontSize="tiny" /> }
			onClick={ handleCopy }
		>
			{ isCopied ? __( 'Copied', 'elementor' ) : __( 'Copy prompt', 'elementor' ) }
		</Button>
	);
};

CopyPromptAction.propTypes = {
	prompt: PropTypes.string.isRequired,
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
					borderRadius: `${ DIALOG_RADIUS }px`,
				},
			} }
		>
			<DialogHeader onClose={ onClose } logo={ false }>
				<Stack spacing={ 0 } minWidth={ 0 }>
					<Typography variant="overline" color="text.tertiary">{ __( 'How to fix', 'elementor' ) }</Typography>
					<DialogTitle component="h2">{ check.title }</DialogTitle>
				</Stack>
			</DialogHeader>
			<DialogContent>
				<Stack spacing={ 2 }>
					<Stack spacing={ 1 }>
						<Stack direction="row" spacing={ 1 } alignItems="center">
							<StepBadge number={ 1 } />
							<Typography variant="body2" color="text.primary">{ __( 'Copy the prompt', 'elementor' ) }</Typography>
						</Stack>
						<Stack
							spacing={ 1 }
							bgcolor={ SCANNER_COLORS.promptBackground }
							borderRadius={ `${ PROMPT_RADIUS }px` }
							px={ 2 }
							pt={ 2 }
							pb={ 1 }
							minHeight={ PROMPT_MIN_HEIGHT }
							justifyContent="flex-end"
						>
							<Typography
								variant="body2"
								color="text.tertiary"
								sx={ {
									fontFamily: '"Roboto Mono", monospace',
									fontSize: 12,
									lineHeight: PROMPT_LINE_HEIGHT,
									letterSpacing: '0.15px',
									whiteSpace: 'pre-wrap',
									maxHeight: PROMPT_MAX_HEIGHT,
									overflowY: 'auto',
								} }
							>
								{ check.fixPrompt }
							</Typography>
							<Stack direction="row" justifyContent="flex-end">
								<CopyPromptAction key={ check.id } prompt={ check.fixPrompt } />
							</Stack>
						</Stack>
					</Stack>
					<Stack direction="row" spacing={ 1 } alignItems="flex-start">
						<StepBadge number={ 2 } />
						<Typography variant="body2" color="text.primary">
							{ __( 'Paste it into your AI assistant. If it\'s connected to your site, it can make the fix. If not, it will walk you through it.', 'elementor' ) }
						</Typography>
					</Stack>
					<Stack direction="row" spacing={ 1 } alignItems="center">
						<StepBadge number={ 3 } />
						<Typography variant="body2" color="text.primary">{ __( 'Scan again when you\'re done', 'elementor' ) }</Typography>
					</Stack>
				</Stack>
			</DialogContent>
			<DialogActions sx={ { px: 3, py: 2, justifyContent: 'space-between' } }>
				<Button variant="text" color="secondary" onClick={ onClose }>
					{ __( 'Skip', 'elementor' ) }
				</Button>
				<Stack direction="row" spacing={ 2 } alignItems="center">
					<Typography variant="body2" color="text.disabled">
						{ sprintf(
							/* Translators: 1: current prompt number, 2: number of prompts. */
							__( '%1$d of %2$d', 'elementor' ),
							index + 1,
							promptChecks.length,
						) }
					</Typography>
					<Button
						variant="text"
						color="inherit"
						endIcon={ <ArrowRightIcon fontSize="tiny" /> }
						disabled={ isLast }
						sx={ { color: 'text.primary', '&.Mui-disabled': { color: 'text.disabled' } } }
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
			</DialogActions>
		</Dialog>
	);
};

HowToFixDialog.propTypes = {
	checks: PropTypes.arrayOf( PropTypes.object ).isRequired,
	checkId: PropTypes.string,
	onClose: PropTypes.func.isRequired,
	onShowCheck: PropTypes.func.isRequired,
};
