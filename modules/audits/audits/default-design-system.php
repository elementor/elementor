<?php

namespace Elementor\Modules\Audits\Audits;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Default_Design_System extends Audit_Descriptor {

	public function get_id(): string {
		return 'audits/default-design-system';
	}

	public function get_title(): string {
		return esc_html__( 'Default website kit is in use', 'elementor' );
	}

	public function get_description(): string {
		return esc_html__( 'Your site is using the default design system colors and fonts. Custom branding makes the site feel uniquely yours.', 'elementor' );
	}

	public function get_fix_hint(): string {
		return esc_html__( 'Open Site Settings and customize your kit (colors, fonts, layout).', 'elementor' );
	}

	public function get_categories(): array {
		return [ self::CATEGORY_HEALTH ];
	}

	public function get_severity(): string {
		return self::SEVERITY_INFO;
	}

	public function get_weight(): int {
		return 3;
	}
}
