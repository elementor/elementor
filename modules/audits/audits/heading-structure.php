<?php

namespace Elementor\Modules\Audits\Audits;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Heading_Structure extends Audit_Descriptor {

	public function get_id(): string {
		return 'audits/heading-structure';
	}

	public function get_title(): string {
		return esc_html__( 'Heading structure', 'elementor' );
	}

	public function get_description(): string {
		return esc_html__( 'Pages should have exactly one H1 and a non-skipping heading order. Screen readers and search engines rely on this structure.', 'elementor' );
	}

	public function get_fix_hint(): string {
		return esc_html__( 'Ensure your page has one H1 and that heading levels do not skip (no H2 → H4).', 'elementor' );
	}

	public function get_fix_plugins(): array {
		return [ self::FIX_PLUGIN_ALLY ];
	}

	public function get_categories(): array {
		return [ self::CATEGORY_SEO, self::CATEGORY_ACCESSIBILITY ];
	}

	public function get_severity(): string {
		return self::SEVERITY_ERROR;
	}

	public function get_weight(): int {
		return 10;
	}
}
