import { __ } from '@wordpress/i18n';

export const GOOD_THRESHOLD = 90;
export const OK_THRESHOLD = 50;

export type ScoreColor = 'success' | 'warning' | 'error';

export type ScoreTier = {
	color: ScoreColor;
	label: string;
};

export function getScoreTier( score: number ): ScoreTier {
	if ( score >= GOOD_THRESHOLD ) {
		return { color: 'success', label: __( 'Good', 'elementor' ) };
	}

	if ( score >= OK_THRESHOLD ) {
		return { color: 'warning', label: __( 'Needs work', 'elementor' ) };
	}

	return { color: 'error', label: __( 'At risk', 'elementor' ) };
}
