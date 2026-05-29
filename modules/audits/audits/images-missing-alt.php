<?php

namespace Elementor\Modules\Audits\Audits;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Images_Missing_Alt extends Audit_Descriptor {

	public function get_id(): string {
		return 'audits/images-missing-alt';
	}

	public function get_title(): string {
		return esc_html__( 'Images missing alt text', 'elementor' );
	}

	public function get_description(): string {
		return esc_html__( 'Every image needs a meaningful alt attribute for screen readers and image-search.', 'elementor' );
	}

	public function get_fix_hint(): string {
		return esc_html__( 'Open the image\'s settings and add an Alt Text describing the image.', 'elementor' );
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
