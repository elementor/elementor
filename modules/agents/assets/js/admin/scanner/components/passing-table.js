import Box from '@elementor/ui/Box';
import Stack from '@elementor/ui/Stack';
import Typography from '@elementor/ui/Typography';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import { getStageLabels, SCAN_SOURCE_URL, SCANNER_LAYOUT, sectionHeadingSx } from '../scanner-constants';
import { TableCard } from './fix-table';

const PassingRow = ( { check, stageLabel, isLast } ) => (
	<Stack direction="row" alignItems="center" height={ SCANNER_LAYOUT.passingRowHeight } borderBottom={ isLast ? 0 : 1 } borderColor="divider">
		<Typography variant="overline" color="text.secondary" width={ SCANNER_LAYOUT.passingStageWidth } px={ 2 } flexShrink={ 0 } lineHeight={ 2 }>
			{ stageLabel }
		</Typography>
		<Typography variant="subtitle2" color="text.primary" flex={ 1 } minWidth={ 0 } px={ 2 }>
			{ check.title }
		</Typography>
		<Stack direction="row" alignItems="center" justifyContent="flex-end" gap={ 1 } width={ SCANNER_LAYOUT.tableColumnWidth } px={ 2 } flexShrink={ 0 } boxSizing="border-box">
			<Box width={ SCANNER_LAYOUT.statusDotSize } height={ SCANNER_LAYOUT.statusDotSize } borderRadius="50%" bgcolor="success.light" />
			<Typography variant="caption" color="text.primary">{ __( 'Pass', 'elementor' ) }</Typography>
		</Stack>
	</Stack>
);

PassingRow.propTypes = {
	check: PropTypes.shape( {
		title: PropTypes.string.isRequired,
	} ).isRequired,
	stageLabel: PropTypes.string.isRequired,
	isLast: PropTypes.bool,
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
					<PassingRow key={ check.id } check={ check } stageLabel={ stageLabels[ check.stage ] } isLast={ index === checks.length - 1 } />
				) ) }
			</TableCard>
			<SourceLine />
		</Stack>
	);
};

PassingTable.propTypes = {
	checks: PropTypes.arrayOf( PropTypes.object ).isRequired,
};
