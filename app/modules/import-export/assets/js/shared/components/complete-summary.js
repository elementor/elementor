import { Box, Typography, Stack } from '@elementor/ui';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';
import SummarySection from './summary-section';

export default function CompleteSummary( {
	summaryData,
	testId = 'complete-summary',
} ) {
	return (
		<Box sx={ {
			width: '100%',
			border: 1,
			borderRadius: 1,
			borderColor: 'action.focus',
			p: 2.5,
			textAlign: 'start',
		} } data-testid={ testId }>
			<Typography variant="subtitle1" color="text.primary" sx={ { mb: 2 } }>
				{ __( 'What\'s included:', 'elementor' ) }
			</Typography>

			<Stack spacing={ 2 } sx={ { maxWidth: '1075px' } } >
				{ Object.entries( summaryData ).map( ( [ sectionKey, sectionValue ] ) =>
					sectionValue ? (
						<SummarySection
							key={ sectionKey }
							sectionKey={ sectionKey }
							title={ sectionValue.title }
							subTitle={ sectionValue.subTitle }
						/>
					) : null,
				) }
			</Stack>
		</Box>
	);
}

CompleteSummary.propTypes = {
	summaryData: PropTypes.objectOf( PropTypes.shape( {
		title: PropTypes.string.isRequired,
		subTitle: PropTypes.string.isRequired,
	} ) ).isRequired,
	testId: PropTypes.string,
};
