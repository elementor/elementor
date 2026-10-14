import type { Dayjs } from 'dayjs';
import * as dayjs from 'dayjs';

export const DATE_FORMAT = 'YYYY-MM-DD';
export const TIME_FORMAT = 'HH:mm';

export function isValidDayjs( value: Dayjs | null ): value is Dayjs {
	return !! value && typeof value.isValid === 'function' && value.isValid();
}

export function parseDateString( raw: string ): Dayjs | null {
	if ( ! raw ) {
		return null;
	}

	const parsed = ( dayjs as unknown as { default: ( s?: string | number | Date ) => Dayjs } ).default( raw );

	return isValidDayjs( parsed ) ? parsed : null;
}

export function parseTimeString( raw: string ): Dayjs | null {
	if ( ! raw ) {
		return null;
	}

	const [ hours, minutes, seconds ] = raw.split( ':' );
	const h = Number.parseInt( hours ?? '', 10 );
	const m = Number.parseInt( minutes ?? '', 10 );
	const s = Number.parseInt( seconds ?? '0', 10 );

	if ( Number.isNaN( h ) || Number.isNaN( m ) ) {
		return null;
	}

	const base = ( dayjs as unknown as { default: () => Dayjs } ).default();
	return base
		.hour( h )
		.minute( m )
		.second( Number.isNaN( s ) ? 0 : s )
		.millisecond( 0 );
}
