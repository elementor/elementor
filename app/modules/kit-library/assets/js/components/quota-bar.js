import { Text } from '@elementor/app-ui';
import PropTypes from 'prop-types';
import './quota-bar.scss';

const QUOTA_BAR_CLASSNAME = 'e-kit-library__quota-bar';

const BYTES_TO_GB = 1024 * 1024 * 1024;
const BYTES_TO_MB = 1024 * 1024;

const convertBytesToGB = ( bytes ) => {
	return Math.round( ( bytes / BYTES_TO_GB ) * 100 ) / 100; // Round to 2 decimal places
};

const convertBytesToMB = ( bytes ) => {
	return Math.round( ( bytes / BYTES_TO_MB ) * 100 ) / 100; // Round to 2 decimal places
};

const formatDisplayValues = ( used, total, unit ) => {
	if ( 'B' === unit ) {
		const totalInGB = convertBytesToGB( total );
		const usedInGB = convertBytesToGB( used );
		const usedInMB = convertBytesToMB( used );

		if ( used === total ) {
			return {
				used: usedInGB,
				usedUnit: 'GB',
				total: totalInGB,
				totalUnit: 'GB',
			};
		}

		if ( usedInGB < 1 ) {
			return {
				used: usedInMB,
				usedUnit: 'MB',
				total: totalInGB,
				totalUnit: 'GB',
			};
		}

		return {
			used: usedInGB,
			usedUnit: 'GB',
			total: totalInGB,
			totalUnit: 'GB',
		};
	}
	return {
		used,
		usedUnit: unit,
		total,
		totalUnit: unit,
	};
};

export default function QuotaBar( { used = 0, total = 15, unit = 'GB', label = 'Storage' } ) {
	const displayValues = formatDisplayValues( used, total, unit );

	const usagePercentage = total > 0 ? Math.min( ( used / total ) * 100, 100 ) : 0;

	const getUsageState = () => {
		if ( 0 === usagePercentage ) {
			return 'empty';
		}

		if ( usagePercentage >= 100 ) {
			return 'alert';
		}

		if ( usagePercentage >= 80 ) {
			return 'warning';
		}

		return 'normal';
	};

	const getProgressBarClass = () => {
		const state = getUsageState();
		return `${ QUOTA_BAR_CLASSNAME }__progress-bar ${ QUOTA_BAR_CLASSNAME }__progress-bar--${ state }`;
	};

	const getProgressContainerClass = () => {
		const state = getUsageState();
		return `${ QUOTA_BAR_CLASSNAME }__progress-container ${ QUOTA_BAR_CLASSNAME }__progress-container--${ state }`;
	};

	const shouldShowUpgradeMessage = () => {
		const state = getUsageState();
		return 'warning' === state || 'alert' === state;
	};

	const getUsageText = () => {
		const state = getUsageState();
		if ( 'warning' === state || 'alert' === state ) {
			return `${ label }: ${ Math.round( usagePercentage ) }%`;
		}
		return label;
	};

	return (
		<div className={ QUOTA_BAR_CLASSNAME }>
			<div className={ `${ QUOTA_BAR_CLASSNAME }__container` }>
				<div className={ `${ QUOTA_BAR_CLASSNAME }__header` }>
					<Text className={ `${ QUOTA_BAR_CLASSNAME }__label` } variant="xs" tag="span">
						{ getUsageText() }
					</Text>
					<Text className={ `${ QUOTA_BAR_CLASSNAME }__count` } variant="xs" tag="span">
						{ displayValues.used } { displayValues.usedUnit } { __( 'of', 'elementor' ) } { displayValues.total } { displayValues.totalUnit }
					</Text>
				</div>
				<div className={ getProgressContainerClass() }>
					<div
						className={ getProgressBarClass() }
						style={ { width: `${ usagePercentage }%` } }
					/>
				</div>
				{ shouldShowUpgradeMessage() && (
					<div className={ `${ QUOTA_BAR_CLASSNAME }__upgrade-message` }>
						<Text variant="xs" tag="span">
							{ __( 'To get more space', 'elementor' ) }
						</Text>
						<a
							className={ `${ QUOTA_BAR_CLASSNAME }__upgrade-link` }
							href="https://go.elementor.com/go-pro-cloud-website-templates-library-advanced/"
							target="_blank"
							rel="noopener noreferrer"
						>
							{ __( 'Upgrade now', 'elementor' ) }
						</a>
					</div>
				) }
			</div>
		</div>
	);
}

QuotaBar.propTypes = {
	used: PropTypes.number,
	total: PropTypes.number,
	unit: PropTypes.string,
	label: PropTypes.string,
};
