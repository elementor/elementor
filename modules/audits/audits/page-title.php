<?php

namespace Elementor\Modules\Audits\Audits;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Page_Title extends Audit_Descriptor {

	public function get_id(): string {
		return 'audits/missing-page-title';
	}

	public function get_title(): string {
		return esc_html__( 'Page title', 'elementor' );
	}

	public function get_description(): string {
		return esc_html__( 'Pages need a clear title for SEO and screen-reader navigation.', 'elementor' );
	}

	public function get_fix_hint(): string {
		return esc_html__( 'Open Page Settings and add a title.', 'elementor' );
	}

	public function get_fix_plugins(): array {
		return [];
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
