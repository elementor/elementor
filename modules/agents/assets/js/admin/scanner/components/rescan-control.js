import { useEffect, useState } from 'react';
import { ReloadIcon } from '@elementor/icons';
import Button from '@elementor/ui/Button';
import IconButton from '@elementor/ui/IconButton';
import Stack from '@elementor/ui/Stack';
import Tooltip from '@elementor/ui/Tooltip';
import { __, sprintf } from '@wordpress/i18n';
import PropTypes from 'prop-types';

const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const MS_PER_MINUTE = SECONDS_PER_MINUTE * MS_PER_SECOND;
const COOLDOWN_TICK_MS = MS_PER_MINUTE;
const MINIMUM_REMAINING_MINUTES = 1;

export const RESCAN_LAYOUT_SCORE_ROW = 'scoreRow';
export const RESCAN_LAYOUT_ERROR_SUMMARY = 'errorSummary';

const getRetryTimestamp = ( retryAt ) => {
	const timestamp = retryAt ? Date.parse( retryAt ) : Number.NaN;

	return Number.isNaN( timestamp ) ? null : timestamp;
};

const formatRemaining = ( remainingMs ) => {
	const totalMinutes = Math.max( MINIMUM_REMAINING_MINUTES, Math.ceil( remainingMs / MS_PER_MINUTE ) );
	const hours = Math.floor( totalMinutes / MINUTES_PER_HOUR );
	const minutes = totalMinutes % MINUTES_PER_HOUR;

	if ( hours > 0 && minutes > 0 ) {
		return `${ hours }h ${ minutes }m`;
	}

	if ( hours > 0 ) {
		return `${ hours }h`;
	}

	return `${ minutes }m`;
};

const getNextScanLabel = ( retryAt, now ) => {
	const retryTimestamp = getRetryTimestamp( retryAt );

	if ( null === retryTimestamp || retryTimestamp <= now ) {
		return '';
	}

	return sprintf(
		/* Translators: %s: Remaining time until the next scan, such as 2h 15m. */
		__( 'Next scan: %s', 'elementor' ),
		formatRemaining( retryTimestamp - now ),
	);
};

export const useNextScanLabel = ( retryAt ) => {
	const [ now, setNow ] = useState( () => Date.now() );

	useEffect( () => {
		const retryTimestamp = getRetryTimestamp( retryAt );

		if ( null === retryTimestamp || retryTimestamp <= Date.now() ) {
			return undefined;
		}

		setNow( Date.now() );
		const timerId = setInterval( () => {
			const current = Date.now();

			setNow( current );

			if ( retryTimestamp <= current ) {
				clearInterval( timerId );
			}
		}, COOLDOWN_TICK_MS );

		return () => clearInterval( timerId );
	}, [ retryAt ] );

	return getNextScanLabel( retryAt, now );
};

const OutlinedRescanButton = ( { label, onRescan, isDisabled } ) => (
	<Tooltip title={ __( 'Reload', 'elementor' ) }>
		<Button
			variant="outlined"
			color="secondary"
			size="small"
			onClick={ onRescan }
			disabled={ isDisabled }
			startIcon={ <ReloadIcon /> }
		>
			{ label }
		</Button>
	</Tooltip>
);

OutlinedRescanButton.propTypes = {
	label: PropTypes.string.isRequired,
	onRescan: PropTypes.func.isRequired,
	isDisabled: PropTypes.bool,
};

export const RescanControl = ( {
	retryAt,
	onRescan,
	isBusy = false,
	isActivated = false,
	layout = RESCAN_LAYOUT_SCORE_ROW,
} ) => {
	const nextScanLabel = useNextScanLabel( retryAt );
	const isCoolingDown = '' !== nextScanLabel;
	const label = isCoolingDown ? nextScanLabel : __( 'Rescan', 'elementor' );
	const isDisabled = isBusy || isCoolingDown;

	if ( RESCAN_LAYOUT_ERROR_SUMMARY === layout ) {
		return (
			<OutlinedRescanButton
				label={ label }
				onRescan={ onRescan }
				isDisabled={ isDisabled }
			/>
		);
	}

	const showLabeledButton = isActivated || isCoolingDown;

	return (
		<>
			{ ! showLabeledButton && (
				<IconButton
					variant="outlined"
					size="small"
					color="secondary"
					onClick={ onRescan }
					disabled={ isBusy }
					aria-label={ __( 'Rescan', 'elementor' ) }
				>
					<ReloadIcon />
				</IconButton>
			) }
			{ showLabeledButton && <Stack flex={ 1 } /> }
			{ showLabeledButton && (
				<OutlinedRescanButton
					label={ label }
					onRescan={ onRescan }
					isDisabled={ isDisabled }
				/>
			) }
		</>
	);
};

RescanControl.propTypes = {
	retryAt: PropTypes.string,
	onRescan: PropTypes.func.isRequired,
	isBusy: PropTypes.bool,
	isActivated: PropTypes.bool,
	layout: PropTypes.oneOf( [ RESCAN_LAYOUT_SCORE_ROW, RESCAN_LAYOUT_ERROR_SUMMARY ] ),
};
