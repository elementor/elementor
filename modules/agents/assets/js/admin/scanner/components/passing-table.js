import { ChevronDownIcon } from '@elementor/icons';
import Box from '@elementor/ui/Box';
import Collapse from '@elementor/ui/Collapse';
import Stack from '@elementor/ui/Stack';
import Typography from '@elementor/ui/Typography';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import { useState } from 'react';

import {
	getStageLabels,
	REDUCED_MOTION_SX,
	SCAN_SOURCE_URL,
	SCANNER_COLORS,
	SCANNER_LAYOUT,
	SCANNER_MOTION,
	sectionHeadingSx,
} from '../scanner-constants';
import { TableCard } from './fix-table';

const ROW_ACTIVATION_KEYS = [ 'Enter', ' ' ];

const DetailSection = ( { title, body } ) => (
	<Stack spacing={ 0.5 }>
		<Typography variant="caption" color="text.primary">{ title }</Typography>
		<Typography variant="caption" color="text.secondary">{ body }</Typography>
	</Stack>
);

DetailSection.propTypes = {
	title: PropTypes.string.isRequired,
	body: PropTypes.string.isRequired,
};

const PassingRow = ( { check, stageLabel, isLast, isOpen, onToggle } ) => {
	const isExpandable = Boolean( check.description || check.evidence );

	const handleKeyDown = ( event ) => {
		if ( event.target !== event.currentTarget || ! ROW_ACTIVATION_KEYS.includes( event.key ) ) {
			return;
		}

		event.preventDefault();
		onToggle( check.id );
	};

	const interactiveProps = isExpandable
		? {
			role: 'button',
			tabIndex: 0,
			'aria-expanded': isOpen,
			onClick: () => onToggle( check.id ),
			onKeyDown: handleKeyDown,
		}
		: {};

	return (
		<Box borderBottom={ isLast ? 0 : 1 } borderColor="divider" bgcolor={ SCANNER_COLORS.paper }>
			<Stack
				direction="row"
				alignItems="center"
				minHeight={ SCANNER_LAYOUT.passingRowHeight }
				{ ...interactiveProps }
				sx={ isExpandable ? {
					cursor: 'pointer',
					'&:hover, &:focus-within': { bgcolor: SCANNER_COLORS.rowHover },
					'&:focus-visible': { outline: 2, outlineColor: 'primary.main', outlineOffset: -2 },
				} : undefined }
			>
				<Typography variant="overline" color="text.secondary" width={ SCANNER_LAYOUT.passingStageWidth } px={ 2 } flexShrink={ 0 } lineHeight={ 2 }>
					{ stageLabel }
				</Typography>
				<Typography variant="subtitle2" color="text.primary" flex={ 1 } minWidth={ 0 } px={ 2 }>
					{ check.title }
				</Typography>
				<Stack direction="row" alignItems="center" justifyContent="flex-end" gap={ 1 } px={ 2 } flexShrink={ 0 } boxSizing="border-box">
					<Box width={ SCANNER_LAYOUT.statusDotSize } height={ SCANNER_LAYOUT.statusDotSize } borderRadius="50%" bgcolor="success.light" />
					<Typography variant="caption" color="text.primary">{ __( 'Pass', 'elementor' ) }</Typography>
					<Box width={ SCANNER_LAYOUT.chevronSize } height={ SCANNER_LAYOUT.chevronSize } display="flex" alignItems="center" justifyContent="center">
						{ isExpandable && (
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
					</Box>
				</Stack>
			</Stack>
			{ isExpandable && (
				<Collapse in={ isOpen } timeout={ SCANNER_MOTION.drawerMs } unmountOnExit>
					<Box mt={ 2 } mx={ 2 } mb={ 1.5 } p={ 2 } bgcolor={ SCANNER_COLORS.promptBackground } borderRadius={ SCANNER_LAYOUT.drawerRadius }>
						<Stack spacing={ 2 }>
							{ check.description && (
								<DetailSection title={ __( 'What it means', 'elementor' ) } body={ check.description } />
							) }
							{ check.evidence && (
								<DetailSection title={ __( 'What we found', 'elementor' ) } body={ check.evidence } />
							) }
						</Stack>
					</Box>
				</Collapse>
			) }
		</Box>
	);
};

PassingRow.propTypes = {
	check: PropTypes.shape( {
		id: PropTypes.string.isRequired,
		title: PropTypes.string.isRequired,
		description: PropTypes.string,
		evidence: PropTypes.string,
	} ).isRequired,
	stageLabel: PropTypes.string.isRequired,
	isLast: PropTypes.bool,
	isOpen: PropTypes.bool,
	onToggle: PropTypes.func.isRequired,
};

const SourceLine = () => (
	<Typography variant="body2" color="text.tertiary">
		{ __( 'Source:', 'elementor' ) }
		{ ' ' }
		<Typography
			component="a"
			variant="body2"
			href={ SCAN_SOURCE_URL }
			target="_blank"
			rel="noreferrer"
			color="inherit"
			sx={ { textDecoration: 'underline' } }
		>
			{ __( 'Ora API', 'elementor' ) }
		</Typography>
	</Typography>
);

export const PassingTable = ( { checks } ) => {
	const [ openIds, setOpenIds ] = useState( {} );

	const toggleRow = ( checkId ) => setOpenIds( ( current ) => ( { ...current, [ checkId ]: ! current[ checkId ] } ) );

	if ( ! checks.length ) {
		return <SourceLine />;
	}

	const stageLabels = getStageLabels();

	return (
		<Stack spacing={ 2 }>
			<Stack spacing={ 0.5 }>
				<Typography component="h3" color="text.primary" sx={ sectionHeadingSx }>
					{ __( 'Already working', 'elementor' ) }
				</Typography>
				<Typography variant="body2" color="text.primary">
					{ __( 'These checks passed. No action needed.', 'elementor' ) }
				</Typography>
			</Stack>
			<TableCard>
				{ checks.map( ( check, index ) => (
					<PassingRow
						key={ check.id }
						check={ check }
						stageLabel={ stageLabels[ check.stage ] }
						isLast={ index === checks.length - 1 }
						isOpen={ Boolean( openIds[ check.id ] ) }
						onToggle={ toggleRow }
					/>
				) ) }
			</TableCard>
			<SourceLine />
		</Stack>
	);
};

PassingTable.propTypes = {
	checks: PropTypes.arrayOf( PropTypes.object ).isRequired,
};
