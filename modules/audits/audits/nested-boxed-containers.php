<?php

namespace Elementor\Modules\Audits\Audits;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Nested_Boxed_Containers extends Audit_Descriptor {

	public function get_id(): string {
		return 'audits/nested-boxed-containers';
	}

	public function get_title(): string {
		return esc_html__( 'Boxed container nested inside a boxed parent', 'elementor' );
	}

	public function get_description(): string {
		return esc_html__( 'An inner container does not need to be boxed when its parent already is. Making it full-width reduces DOM nodes and improves performance.', 'elementor' );
	}

	public function get_fix_hint(): string {
		return esc_html__( 'Change the inner container\'s content width to Full Width.', 'elementor' );
	}

	public function get_categories(): array {
		return [ self::CATEGORY_PERFORMANCE, self::CATEGORY_HEALTH ];
	}

	public function get_severity(): string {
		return self::SEVERITY_WARNING;
	}

	public function get_weight(): int {
		return 5;
	}
}
