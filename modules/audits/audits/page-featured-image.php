<?php

namespace Elementor\Modules\Audits\Audits;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Page_Featured_Image extends Audit_Descriptor {

	public function get_id(): string {
		return 'audits/missing-featured-image';
	}

	public function get_title(): string {
		return esc_html__( 'Featured image', 'elementor' );
	}

	public function get_description(): string {
		return esc_html__( 'Featured images are used by social shares and many themes for hero visuals.', 'elementor' );
	}

	public function get_fix_hint(): string {
		return esc_html__( 'Open Page Settings and set a featured image.', 'elementor' );
	}

	public function get_categories(): array {
		return [ self::CATEGORY_SEO ];
	}

	public function get_severity(): string {
		return self::SEVERITY_WARNING;
	}

	public function get_weight(): int {
		return 5;
	}
}
