<?php

namespace Elementor\Modules\Audits\Audits;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Icon_Widget_Link_Missing_Aria_Label extends Audit_Descriptor {

	public function get_id(): string {
		return 'audits/icon-widget-link-missing-aria-label';
	}

	public function get_title(): string {
		return esc_html__( 'Icon link missing aria-label', 'elementor' );
	}

	public function get_description(): string {
		return esc_html__( 'Icon-only links need an aria-label (or aria-labelledby) so screen readers can announce the link target.', 'elementor' );
	}

	public function get_fix_hint(): string {
		return esc_html__( 'Add an aria-label custom attribute to the icon widget describing the link\'s destination.', 'elementor' );
	}

	public function get_categories(): array {
		return [ self::CATEGORY_ACCESSIBILITY ];
	}

	public function get_severity(): string {
		return self::SEVERITY_WARNING;
	}

	public function get_weight(): int {
		return 5;
	}
}
