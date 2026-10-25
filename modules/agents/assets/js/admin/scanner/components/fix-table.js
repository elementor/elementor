import Box from '@elementor/ui/Box';
import Skeleton from '@elementor/ui/Skeleton';
import Stack from '@elementor/ui/Stack';
import Typography from '@elementor/ui/Typography';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import { getToggleModuleKey } from '../scanner-check-settings';
import { FIX_WITH_TOGGLE, REDUCED_MOTION_SX, SCANNER_COLORS, SCANNER_LAYOUT, SCANNER_MOTION } from '../scanner-constants';
import { FixRow } from './fix-row';

const ROW_RISE = '3px';
const SKELETON_TITLE_WIDTH = '55%';
const SKELETON_ACTION_WIDTH = 96;
const SKELETON_ACTION_HEIGHT = 24;
const HEADER_FONT_SIZE = '12px';
const HEADER_LETTER_SPACING = '1px';

const rowAppearSx = {
	animation: `scannerRowIn ${ SCANNER_MOTION.rowAppearMs }ms ease-out`,
	'@keyframes scannerRowIn': {
		from: { opacity: 0, transform: `translateY(${ ROW_RISE })` },
		to: { opacity: 1, transform: 'translateY(0)' },
	},
	...REDUCED_MOTION_SX,
};

export const TableCard = ( { children } ) => (
	<Box bgcolor={ SCANNER_COLORS.paper } border={ 1 } borderColor="divider" borderRadius={ SCANNER_LAYOUT.cardRadius } overflow="hidden">
		{ children }
	</Box>
);

TableCard.propTypes = {
	children: PropTypes.node.isRequired,
};

export const TableHeaderCell = ( { children, width, align = 'left' } ) => (
	<Typography
		variant="overline"
		color="text.secondary"
		width={ width }
		flex={ width ? 'none' : 1 }
		textAlign={ align }
		px={ 2 }
		boxSizing="border-box"
		lineHeight={ 2 }
		sx={ { fontSize: HEADER_FONT_SIZE, letterSpacing: HEADER_LETTER_SPACING } }
	>
		{ children }
	</Typography>
);

TableHeaderCell.propTypes = {
	children: PropTypes.node.isRequired,
	width: PropTypes.number,
	align: PropTypes.string,
};

export const CheckTableHeader = () => (
	<TableHeader>
		<TableHeaderCell>{ __( 'Check', 'elementor' ) }</TableHeaderCell>
		<TableHeaderCell width={ SCANNER_LAYOUT.actionColumnWidth } align="right">{ __( 'Actions', 'elementor' ) }</TableHeaderCell>
	</TableHeader>
);

export const TableHeader = ( { children } ) => (
	<Stack direction="row" alignItems="center" height={ SCANNER_LAYOUT.tableHeaderHeight } bgcolor={ SCANNER_COLORS.tableHeader }>
		{ children }
	</Stack>
);

TableHeader.propTypes = {
	children: PropTypes.node.isRequired,
};

const SkeletonRow = () => (
	<Stack direction="row" alignItems="center" gap={ 3 } minHeight={ SCANNER_LAYOUT.fixRowMinHeight } p={ 2 } boxSizing="border-box" borderBottom={ 1 } borderColor="divider">
		<Skeleton variant="circular" width={ SCANNER_LAYOUT.statusDotSize } height={ SCANNER_LAYOUT.statusDotSize } />
		<Skeleton variant="text" width={ SKELETON_TITLE_WIDTH } sx={ { bgcolor: 'action.hover' } } />
		<Box flex={ 1 } />
		<Skeleton variant="rounded" width={ SKELETON_ACTION_WIDTH } height={ SKELETON_ACTION_HEIGHT } sx={ { bgcolor: 'action.hover' } } />
	</Stack>
);

export const FixTableRows = ( { checks, flow, agentAccessUrl, seoPluginSearchUrl, isLoading } ) => (
	<Box aria-busy={ isLoading }>
		{ isLoading
			? checks.map( ( check ) => <SkeletonRow key={ check.id } /> )
			: checks.map( ( check, index ) => {
				const moduleKey = FIX_WITH_TOGGLE === check.fixWith ? getToggleModuleKey( check.id ) : null;
				const isToggleDisabled = moduleKey && flow.isModuleToggleDisabled?.( moduleKey );
				const toggleDisabledReason = moduleKey ? flow.getToggleDisabledReason?.( moduleKey ) ?? null : null;

				return (
					<Box key={ check.id } sx={ rowAppearSx }>
						<FixRow
							check={ check }
							isOpen={ !! flow.openIds[ check.id ] }
							isResolved={ moduleKey ? !! flow.moduleEnabled?.[ moduleKey ] : !! flow.resolvedIds[ check.id ] }
							isSaving={ !! flow.savingCheckIds?.[ check.id ] || !! ( moduleKey && flow.savingModuleKeys?.[ moduleKey ] ) }
							isToggleDisabled={ !! isToggleDisabled }
							toggleDisabledReason={ toggleDisabledReason }
							isLast={ index === checks.length - 1 }
							preferenceValue={ flow.preferences[ check.id ] }
							agentAccessUrl={ agentAccessUrl }
							seoPluginSearchUrl={ seoPluginSearchUrl }
							onToggle={ flow.toggleRow }
							onOpen={ flow.openRow }
							onCopyPrompt={ flow.openHowToFix }
							onFixWithAngie={ flow.fixWithAngie }
							onSetEnabled={ flow.setCheckEnabled }
							onUndo={ flow.undoFix }
							onRescan={ flow.startScan }
							onPreferenceChange={ flow.setPreference }
							onSavePreference={ flow.savePreference }
						/>
					</Box>
				);
			} ) }
	</Box>
);

const fixTableRowsPropTypes = {
	checks: PropTypes.arrayOf( PropTypes.object ).isRequired,
	flow: PropTypes.shape( {
		openIds: PropTypes.object.isRequired,
		resolvedIds: PropTypes.object.isRequired,
		moduleEnabled: PropTypes.object,
		isModuleToggleDisabled: PropTypes.func,
		getToggleDisabledReason: PropTypes.func,
		savingModuleKeys: PropTypes.object,
		savingCheckIds: PropTypes.object,
		preferences: PropTypes.object.isRequired,
		toggleRow: PropTypes.func.isRequired,
		openRow: PropTypes.func.isRequired,
		openHowToFix: PropTypes.func.isRequired,
		fixWithAngie: PropTypes.func.isRequired,
		setCheckEnabled: PropTypes.func.isRequired,
		undoFix: PropTypes.func.isRequired,
		startScan: PropTypes.func.isRequired,
		setPreference: PropTypes.func.isRequired,
		savePreference: PropTypes.func.isRequired,
	} ).isRequired,
	agentAccessUrl: PropTypes.string.isRequired,
	seoPluginSearchUrl: PropTypes.string.isRequired,
	isLoading: PropTypes.bool,
};

FixTableRows.propTypes = fixTableRowsPropTypes;

export const FixTable = ( props ) => (
	<TableCard>
		<CheckTableHeader />
		<FixTableRows { ...props } />
	</TableCard>
);

FixTable.propTypes = fixTableRowsPropTypes;
