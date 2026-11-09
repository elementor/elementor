import { useState } from 'react';
import Button from '@elementor/ui/Button';
import Chip from '@elementor/ui/Chip';
import Divider from '@elementor/ui/Divider';
import MenuItem from '@elementor/ui/MenuItem';
import Select from '@elementor/ui/Select';
import Stack from '@elementor/ui/Stack';
import Typography from '@elementor/ui/Typography';
import { __, sprintf } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import { wpAdminInputResetSx } from '../../components/wp-admin-sx';
import {
	getStageLabels,
	PRIORITY_RECOMMENDED,
	PRIORITY_REQUIRED,
	SCANNER_LAYOUT,
	sectionHeadingSx,
	STAGE_ACT,
	STAGE_IDENTIFY,
	STAGE_REACH,
} from '../scanner-constants';
import { getToggleModuleKey } from '../scanner-check-settings';
import { ChecksSummary } from './checks-summary';
import { FixTable, FixTableRows } from './fix-table';

const TYPE_ALL = 'all';
const PRIORITY_ALL = 'all';
const FILTER_STAGES = [ STAGE_REACH, STAGE_IDENTIFY, STAGE_ACT ];
const SECTION_GAP = '20px';
const VISIBLE_FIX_COUNT = 5;

const getTypeOptions = () => {
	const stageLabels = getStageLabels();

	return [
		{ id: TYPE_ALL, label: __( 'All', 'elementor' ) },
		...FILTER_STAGES.map( ( stage ) => ( { id: stage, label: stageLabels[ stage ] } ) ),
	];
};

const isFixedByActivation = ( check, flow ) => {
	if ( ! check.resolvedByActivation ) {
		return false;
	}

	const moduleKey = getToggleModuleKey( check.id );

	if ( ! moduleKey ) {
		return true;
	}

	return ! flow.isModuleUnavailable?.( moduleKey ) && ! flow.moduleEnabled?.[ moduleKey ];
};

export const FixesFilters = ( { priority, stage, onPriorityChange, onStageChange, isDisabled } ) => (
	<Stack direction="row" alignItems="center" gap={ 2 } flexWrap="wrap">
		<Stack direction="row" alignItems="center" gap={ 1 }>
			<Typography variant="body2" color={ isDisabled ? 'text.disabled' : 'text.primary' } sx={ { fontSize: '13px' } }>
				{ __( 'Priority', 'elementor' ) }
			</Typography>
			<Select
				size="tiny"
				value={ priority }
				disabled={ isDisabled }
				onChange={ ( event ) => onPriorityChange( event.target.value ) }
				inputProps={ { 'aria-label': __( 'Priority', 'elementor' ) } }
				sx={ { ...wpAdminInputResetSx, width: SCANNER_LAYOUT.prioritySelectWidth } }
			>
				<MenuItem value={ PRIORITY_ALL }>{ __( 'All', 'elementor' ) }</MenuItem>
				<MenuItem value={ PRIORITY_REQUIRED }>{ __( 'Required', 'elementor' ) }</MenuItem>
				<MenuItem value={ PRIORITY_RECOMMENDED }>{ __( 'Recommended', 'elementor' ) }</MenuItem>
			</Select>
		</Stack>
		<Divider orientation="vertical" flexItem />
		<Stack direction="row" alignItems="center" gap={ 1 } flexWrap="wrap">
			<Typography variant="body2" color={ isDisabled ? 'text.disabled' : 'text.primary' } sx={ { fontSize: '13px' } }>
				{ __( 'Layer', 'elementor' ) }
			</Typography>
			{ getTypeOptions().map( ( option ) => (
				<Chip
					key={ option.id }
					size="small"
					shape="rounded"
					color={ stage === option.id ? 'primary' : 'default' }
					label={ option.label }
					disabled={ isDisabled }
					onClick={ () => onStageChange( option.id ) }
					aria-pressed={ stage === option.id }
				/>
			) ) }
		</Stack>
	</Stack>
);

FixesFilters.propTypes = {
	priority: PropTypes.string.isRequired,
	stage: PropTypes.string.isRequired,
	onPriorityChange: PropTypes.func.isRequired,
	onStageChange: PropTypes.func.isRequired,
	isDisabled: PropTypes.bool,
};

export const FixesSection = ( { checks, flow, agentAccessUrl, seoPluginSearchUrl, isActivated, isLoading } ) => {
	const [ selectedType, setSelectedType ] = useState( TYPE_ALL );
	const [ priority, setPriority ] = useState( PRIORITY_ALL );
	const [ isShowAllFixes, setIsShowAllFixes ] = useState( false );
	const isExpanded = flow.areChecksExpanded || isLoading;
	const filteredChecks = checks.filter( ( check ) => {
		const matchesPriority = PRIORITY_ALL === priority || check.priority === priority;
		const matchesType = TYPE_ALL === selectedType || check.stage === selectedType;

		return matchesPriority && matchesType;
	} );
	const shownChecks = isShowAllFixes ? filteredChecks : filteredChecks.slice( 0, VISIBLE_FIX_COUNT );
	const hiddenFixCount = Math.max( 0, filteredChecks.length - VISIBLE_FIX_COUNT );
	const isFixListVisible = isActivated || isExpanded;
	const activationFixes = checks.filter( ( check ) => isFixedByActivation( check, flow ) ).length;

	return (
		<Stack gap={ SECTION_GAP }>
			<Typography component="h3" color="text.primary" sx={ sectionHeadingSx }>{ __( 'Fix these next', 'elementor' ) }</Typography>
			<FixesFilters
				priority={ priority }
				stage={ selectedType }
				onPriorityChange={ setPriority }
				onStageChange={ setSelectedType }
			/>
			{ ! isActivated && (
				<ChecksSummary
					checks={ checks }
					activationFixes={ activationFixes }
					isExpanded={ isExpanded }
					isLoading={ isLoading }
					onToggle={ flow.toggleChecksExpanded }
				>
					{ isExpanded && (
						<FixTableRows checks={ shownChecks } flow={ flow } agentAccessUrl={ agentAccessUrl } seoPluginSearchUrl={ seoPluginSearchUrl } isLoading={ isLoading } />
					) }
				</ChecksSummary>
			) }
			{ isActivated && (
				<FixTable checks={ shownChecks } flow={ flow } agentAccessUrl={ agentAccessUrl } seoPluginSearchUrl={ seoPluginSearchUrl } isLoading={ isLoading } />
			) }
			{ isFixListVisible && hiddenFixCount > 0 && (
				<Stack direction="row" justifyContent="flex-end">
					<Button variant="text" color="info" size="medium" onClick={ () => setIsShowAllFixes( ( current ) => ! current ) }>
						{ isShowAllFixes
							? __( 'Show less', 'elementor' )
							: sprintf(
								/* Translators: %d: Number of fixes not shown in the list. */
								__( 'Show all fixes (+%d)', 'elementor' ),
								hiddenFixCount,
							) }
					</Button>
				</Stack>
			) }
		</Stack>
	);
};

FixesSection.propTypes = {
	checks: PropTypes.arrayOf( PropTypes.object ).isRequired,
	flow: PropTypes.object.isRequired,
	agentAccessUrl: PropTypes.string.isRequired,
	seoPluginSearchUrl: PropTypes.string.isRequired,
	isActivated: PropTypes.bool,
	isLoading: PropTypes.bool,
};
