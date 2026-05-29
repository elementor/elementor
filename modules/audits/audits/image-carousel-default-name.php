<?php

namespace Elementor\Modules\Audits\Audits;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Image_Carousel_Default_Name extends Audit_Descriptor {

	public function get_id(): string {
		return 'audits/image-carousel-default-name';
	}

	public function get_title(): string {
		return esc_html__( 'Image carousel uses its default accessible name', 'elementor' );
	}

	public function get_description(): string {
		return esc_html__( 'A generic name like "Image Carousel" is not descriptive for screen readers or for search engines.', 'elementor' );
	}

	public function get_fix_hint(): string {
		return esc_html__( 'Set a meaningful accessible name based on what the carousel actually contains.', 'elementor' );
	}

	public function get_categories(): array {
		return [ self::CATEGORY_ACCESSIBILITY, self::CATEGORY_SEO ];
	}

	public function get_severity(): string {
		return self::SEVERITY_WARNING;
	}

	public function get_weight(): int {
		return 5;
	}
}
