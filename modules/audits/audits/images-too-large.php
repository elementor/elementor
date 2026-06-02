<?php

namespace Elementor\Modules\Audits\Audits;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Images_Too_Large extends Audit_Descriptor {

	public function get_id(): string {
		return 'audits/images-too-large';
	}

	public function get_title(): string {
		return esc_html__( 'Oversized images', 'elementor' );
	}

	public function get_description(): string {
		return esc_html__( 'Large image files slow down the page. Compress or resize images above 500 KB.', 'elementor' );
	}

	public function get_fix_hint(): string {
		return esc_html__( 'Replace the image with a smaller version or enable image optimization.', 'elementor' );
	}

	public function get_fix_plugins(): array {
		return [ self::FIX_PLUGIN_IMAGE_OPTIMIZER ];
	}

	public function get_categories(): array {
		return [ self::CATEGORY_PERFORMANCE ];
	}

	public function get_severity(): string {
		return self::SEVERITY_WARNING;
	}

	public function get_weight(): int {
		return 7;
	}
}
