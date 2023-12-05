import { __ } from '@wordpress/i18n';
import { daysDiff, MONTH_DECEMBER_INDEX, MONTH_JANUARY_INDEX, translateDate } from '../../../helpers/date-helpers';
import PromptHistoryPeriod from '../parts/modal-period';

const DATE_KEY = 'date';

export const LAST_7_DAYS_KEY = '7-days';
export const LAST_30_DAYS_KEY = '30-days';

const MONTH_FORMAT = __( 'F', 'elementor' );

/**
 * Sorts items in ascending order by date.
 *
 * @param {Array} historyData
 * @return {Array}
 */
const sortPromptHistoryData = ( historyData ) => {
	const clone = [ ...historyData ];
	return clone.sort( ( a, b ) => new Date( b[ DATE_KEY ] ) - new Date( a[ DATE_KEY ] ) );
};

/**
 * Groups prompt history data by time periods.
 *
 * @param {Array} historyData
 * @return {Object.<string, {label: string, items: any[]}>}
 */
export const groupPromptHistoryData = ( historyData ) => {
	const data = sortPromptHistoryData( historyData );
	const currentDate = new Date();

	const result = {
		[ LAST_7_DAYS_KEY ]: { label: __( 'Last 7 days', 'elementor' ), items: [] },
		[ LAST_30_DAYS_KEY ]: { label: __( 'Last 30 days', 'elementor' ), items: [] },
	};

	for ( const item of data ) {
		const date = new Date( item[ DATE_KEY ] );
		const diff = daysDiff( date, currentDate );

		if ( diff <= 7 ) {
			result[ LAST_7_DAYS_KEY ].items.push( item );
			continue;
		}

		if ( diff <= 30 ) {
			result[ LAST_30_DAYS_KEY ].items.push( item );
			continue;
		}

		const month = date.getMonth();

		if ( ! result[ month ] ) {
			result[ month ] = { label: translateDate( MONTH_FORMAT, date ), items: [] };
		}

		result[ month ].items.push( item );
	}

	return result;
};

export const renderPeriods = ( { items, onDelete } ) => {
	const groupData = groupPromptHistoryData( items );
	const periods = [];

	if ( groupData[ LAST_7_DAYS_KEY ]?.items?.length ) {
		periods.push( <PromptHistoryPeriod periodTitle={ groupData[ LAST_7_DAYS_KEY ].label }
			onHistoryItemDelete={ onDelete }
			historyItems={ groupData[ LAST_7_DAYS_KEY ].items } /> );
	}

	if ( groupData[ LAST_30_DAYS_KEY ]?.items?.length ) {
		periods.push( <PromptHistoryPeriod periodTitle={ groupData[ LAST_30_DAYS_KEY ].label }
			onHistoryItemDelete={ onDelete }
			historyItems={ groupData[ LAST_30_DAYS_KEY ].items } /> );
	}

	for ( let i = MONTH_DECEMBER_INDEX; i >= MONTH_JANUARY_INDEX; i-- ) {
		if ( groupData[ i ] ) {
			periods.push( <PromptHistoryPeriod periodTitle={ groupData[ i ].label }
				onHistoryItemDelete={ onDelete }
				historyItems={ groupData[ i ].items } /> );
		}
	}

	return periods;
};
