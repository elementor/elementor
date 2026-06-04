import { type ChipProps } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

export const GOOD_THRESHOLD = 90;
export const OK_THRESHOLD = 50;

export type ScoreColor = 'success' | 'warning' | 'error';

export function scoreColor( score: number ): ScoreColor {
	if ( score >= GOOD_THRESHOLD ) {
		return 'success';
	}

	if ( score >= OK_THRESHOLD ) {
		return 'warning';
	}

	return 'error';
}

export function scoreStatusLabel( score: number ): string {
	if ( score >= GOOD_THRESHOLD ) {
		return __( 'Good', 'elementor' );
	}

	if ( score >= OK_THRESHOLD ) {
		return __( 'Needs work', 'elementor' );
	}

	return __( 'At risk', 'elementor' );
}

export function scoreStatusColor( score: number ): ChipProps[ 'color' ] {
	return scoreColor( score );
}
