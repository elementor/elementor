import { ChevronDownIcon, CircleCheckFilledIcon } from '@elementor/icons';
import Box from '@elementor/ui/Box';
import Button from '@elementor/ui/Button';
import Chip from '@elementor/ui/Chip';
import Collapse from '@elementor/ui/Collapse';
import Stack from '@elementor/ui/Stack';
import Typography from '@elementor/ui/Typography';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import {
	FIX_WITH_ANGIE,
	FIX_WITH_PREFERENCE,
	CHECK_STATUS_FAIL,
	getCheckStatusDotColor,
	getCheckStatusLabel,
	getCheckPriorityLabel,
	PRIORITY_RECOMMENDED,
	PRIORITY_REQUIRED,
	REDUCED_MOTION_SX,
	SCANNER_COLORS,
	SCANNER_LAYOUT,
	SCANNER_MOTION,
	VISUALLY_HIDDEN_SX,
} from '../scanner-constants';
import { CopyPromptButton, RowAction } from './fix-row-actions';
import { FixRowDrawer } from './fix-row-drawer';

const ROW_ACTIVATION_KEYS = [ 'Enter', ' ' ];

const stopPropagation = ( event ) => event.stopPropagation();

const completedCheckSx = {
	color: 'success.main',
	fontSize: SCANNER_LAYOUT.completedIconSize,
	flexShrink: 0,
	animation: `scannerCheckIn ${ SCANNER_MOTION.completedCheckMs }ms ${ SCANNER_MOTION.overshoot }`,
	'@keyframes scannerCheckIn': {
		from: { transform: 'scale(0.4)' },
		to: { transform: 'scale(1)' },
	},
	...REDUCED_MOTION_SX,
};

const PRIORITY_CHIP_COLORS = {
	[ PRIORITY_REQUIRED ]: 'error',
	[ PRIORITY_RECOMMENDED ]: 'success',
};

const PriorityChip = ( { priority } ) => {
	if ( ! PRIORITY_CHIP_COLORS[ priority ] ) {
		return null;
	}

	return <Chip size="tiny" shape="rounded" variant="standard" color={ PRIORITY_CHIP_COLORS[ priority ] } label={ getCheckPriorityLabel( { priority } ) } />;
};

PriorityChip.propTypes = {
	priority: PropTypes.string,
};

const getDotColor = ( check ) => getCheckStatusDotColor( check.status ?? CHECK_STATUS_FAIL );

const StatusIndicator = ( { check, isCompleted } ) => {
	if ( isCompleted ) {
		return <CircleCheckFilledIcon sx={ completedCheckSx } aria-label={ __( 'Fixed', 'elementor' ) } />;
	}

	return (
		<Box width={ SCANNER_LAYOUT.statusIconSlot } display="flex" justifyContent="center" flexShrink={ 0 }>
			<Box
				width={ SCANNER_LAYOUT.statusDotSize }
				height={ SCANNER_LAYOUT.statusDotSize }
				borderRadius="50%"
				bgcolor={ getDotColor( check ) }
			/>
			<Box component="span" sx={ VISUALLY_HIDDEN_SX }>{ getCheckStatusLabel( check.status ?? CHECK_STATUS_FAIL ) }</Box>
		</Box>
	);
};

StatusIndicator.propTypes = {
	check: PropTypes.object.isRequired,
	isCompleted: PropTypes.bool,
};

export const FixRow = ( {
	check,
	isOpen,
	isResolved,
	isSaving = false,
	isToggleDisabled = false,
	toggleDisabledReason = null,
	isLast,
	preferenceValue = '',
	agentAccessUrl,
	seoPluginSearchUrl,
	onToggle,
	onOpen,
	onCopyPrompt,
	onFixWithAngie,
	onSetEnabled,
	onUndo,
	onRescan,
	onPreferenceChange,
	onSavePreference,
} ) => {
	const isCompleted = isResolved;
	const titleIsPrimary = isOpen || isCompleted;
	const showCopyPrompt = FIX_WITH_ANGIE === check.fixWith && Boolean( check.fixPrompt ) && ! isCompleted;

	const handleKeyDown = ( event ) => {
		if ( event.target !== event.currentTarget || ! ROW_ACTIVATION_KEYS.includes( event.key ) ) {
			return;
		}

		event.preventDefault();
		onToggle( check.id );
	};

	return (
		<Box borderBottom={ isOpen || isLast ? 0 : 1 } borderColor="divider" bgcolor={ SCANNER_COLORS.paper }>
			<Stack
				role="button"
				tabIndex={ 0 }
				aria-expanded={ isOpen }
				direction="row"
				alignItems="center"
				gap={ 3 }
				minHeight={ SCANNER_LAYOUT.fixRowMinHeight }
				p={ 2 }
				boxSizing="border-box"
				onClick={ () => onToggle( check.id ) }
				onKeyDown={ handleKeyDown }
				sx={ {
					cursor: 'pointer',
					bgcolor: isOpen ? SCANNER_COLORS.paper : undefined,
					'& .scanner-fix-title': { color: titleIsPrimary ? 'text.primary' : 'text.secondary' },
					'&:hover, &:focus-within': { bgcolor: isOpen ? SCANNER_COLORS.paper : SCANNER_COLORS.rowHover },
					'&:hover .scanner-fix-title, &:focus-within .scanner-fix-title': { color: 'text.primary' },
					'& .scanner-copy-fix': { display: 'none' },
					'&:hover .scanner-copy-fix, &:focus-within .scanner-copy-fix': { display: 'inline-flex' },
					'&:focus-visible': { outline: 2, outlineColor: 'primary.main', outlineOffset: -2 },
				} }
			>
				<Stack direction="row" alignItems="center" gap={ isCompleted ? 1 : 0.5 } flex={ 1 } minWidth={ 0 }>
					<StatusIndicator check={ check } isCompleted={ isCompleted } />
					<Typography className="scanner-fix-title" variant="body2">{ check.title }</Typography>
					{ ! isCompleted && <PriorityChip priority={ check.priority } /> }
				</Stack>
				<Stack direction="row" alignItems="center" justifyContent="flex-end" gap={ 1 } minWidth={ SCANNER_LAYOUT.actionAreaWidth } flexShrink={ 0 }>
					{ /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- Keeps the row's own toggle from firing when an action is used. */ }
					<Box onClick={ stopPropagation } onKeyDown={ stopPropagation }>
						<Stack direction="row" alignItems="center" gap={ 1 }>
							{ showCopyPrompt && <CopyPromptButton onCopy={ () => onCopyPrompt( check ) } /> }
							<RowAction
								check={ check }
								isResolved={ isResolved }
								isSaving={ isSaving }
								isToggleDisabled={ isToggleDisabled }
								toggleDisabledReason={ toggleDisabledReason }
								agentAccessUrl={ agentAccessUrl }
								seoPluginSearchUrl={ seoPluginSearchUrl }
								onOpen={ onOpen }
								onFixWithAngie={ onFixWithAngie }
								onSetEnabled={ onSetEnabled }
								onUndo={ onUndo }
								onRescan={ onRescan }
							/>
						</Stack>
					</Box>
					{ ! isCompleted && (
						<ChevronDownIcon
							sx={ {
								fontSize: SCANNER_LAYOUT.chevronSize,
								color: 'text.tertiary',
								transform: isOpen ? 'rotate(180deg)' : 'none',
								transition: `transform ${ SCANNER_MOTION.chevronMs }ms ${ SCANNER_MOTION.easeOutExpo }`,
								...REDUCED_MOTION_SX,
							} }
						/>
					) }
				</Stack>
			</Stack>
			<Collapse in={ isOpen } timeout={ SCANNER_MOTION.drawerMs } unmountOnExit>
				<FixRowDrawer
					check={ check }
					preferenceValue={ preferenceValue }
					onPreferenceChange={ onPreferenceChange }
					onSavePreference={ onSavePreference }
				/>
				{ FIX_WITH_PREFERENCE === check.fixWith && (
					<Stack direction="row" justifyContent="flex-end" px={ 2 } pb={ 1.5 }>
						<Button variant="text" color="secondary" size="small" onClick={ () => onToggle( check.id ) }>
							{ __( 'Skip', 'elementor' ) }
						</Button>
					</Stack>
				) }
			</Collapse>
			{ isOpen && ! isLast && <Box borderBottom={ 1 } borderColor="divider" /> }
		</Box>
	);
};

FixRow.propTypes = {
	check: PropTypes.object.isRequired,
	isOpen: PropTypes.bool,
	isResolved: PropTypes.bool,
	isSaving: PropTypes.bool,
	isToggleDisabled: PropTypes.bool,
	toggleDisabledReason: PropTypes.string,
	isLast: PropTypes.bool,
	preferenceValue: PropTypes.string,
	agentAccessUrl: PropTypes.string.isRequired,
	seoPluginSearchUrl: PropTypes.string.isRequired,
	onToggle: PropTypes.func.isRequired,
	onOpen: PropTypes.func.isRequired,
	onCopyPrompt: PropTypes.func.isRequired,
	onFixWithAngie: PropTypes.func.isRequired,
	onSetEnabled: PropTypes.func.isRequired,
	onUndo: PropTypes.func.isRequired,
	onRescan: PropTypes.func.isRequired,
	onPreferenceChange: PropTypes.func.isRequired,
	onSavePreference: PropTypes.func.isRequired,
};
