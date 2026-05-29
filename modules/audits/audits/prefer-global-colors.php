<?php

namespace Elementor\Modules\Audits\Audits;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Prefer_Global_Colors extends Audit_Descriptor {

	public function get_id(): string {
		return 'audits/prefer-global-colors';
	}

	public function get_title(): string {
		return esc_html__( 'Prefer global colors over hard-coded values', 'elementor' );
	}

	public function get_description(): string {
		return esc_html__( 'Global colors make the design consistent and easy to update site-wide.', 'elementor' );
	}

	public function get_fix_hint(): string {
		return esc_html__( 'Replace the hard-coded color with one of your kit\'s global colors.', 'elementor' );
	}

	public function get_categories(): array {
		return [ self::CATEGORY_HEALTH, self::CATEGORY_BEST_PRACTICES ];
	}

	public function get_severity(): string {
		return self::SEVERITY_INFO;
	}

	public function get_weight(): int {
		return 3;
	}
}
