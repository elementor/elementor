import { Button, CircularProgress } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

export const UsageTimesColumn = ( {
	widgetName,
	usageData,
	isLoading,
	getWidgetUsage,
	onScanClick,
} ) => {
	if ( null !== usageData ) {
		return (
			<>
				{ getWidgetUsage( widgetName ) } { __( 'times', 'elementor' ) }
			</>
		);
	}

	if ( isLoading ) {
		return <CircularProgress color="secondary" size={ 20 } />;
	}

	return (
		<Button
			onClick={ onScanClick }
			size="small"
			variant="outlined"
			color="secondary"
			className="e-id-elementor-element-manager-button-show-usage"
			sx={ {
				minWidth: ( theme ) => theme.spacing( 6 ),
				height: 26,
			} }
		>
			{ __( 'Show', 'elementor' ) }
		</Button>
	);
};

UsageTimesColumn.propTypes = {
	widgetName: PropTypes.string.isRequired,
	usageData: PropTypes.object,
	isLoading: PropTypes.bool,
	getWidgetUsage: PropTypes.func.isRequired,
	onScanClick: PropTypes.func.isRequired,
};

