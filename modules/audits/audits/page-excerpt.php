<?php

namespace Elementor\Modules\Audits\Audits;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Page_Excerpt extends Audit_Descriptor {

	public function get_id(): string {
		return 'audits/missing-excerpt';
	}

	public function get_title(): string {
		return esc_html__( 'Page excerpt', 'elementor' );
	}

	public function get_description(): string {
		return esc_html__( 'A descriptive excerpt helps search engines and previews summarize the page.', 'elementor' );
	}

	public function get_fix_hint(): string {
		return esc_html__( 'Open Page Settings and write a short excerpt.', 'elementor' );
	}

	public function get_fix_plugins(): array {
		return [];
	}

	public function get_categories(): array {
		return [ self::CATEGORY_SEO, self::CATEGORY_ACCESSIBILITY ];
	}

	public function get_severity(): string {
		return self::SEVERITY_WARNING;
	}

	public function get_weight(): int {
		return 5;
	}
}
