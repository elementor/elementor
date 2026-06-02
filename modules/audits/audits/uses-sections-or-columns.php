<?php

namespace Elementor\Modules\Audits\Audits;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Uses_Sections_Or_Columns extends Audit_Descriptor {

	public function get_id(): string {
		return 'audits/uses-sections-or-columns';
	}

	public function get_title(): string {
		return esc_html__( 'Uses outdated sections or columns', 'elementor' );
	}

	public function get_description(): string {
		return esc_html__( 'Sections and columns are legacy elements. Containers render fewer DOM nodes and are more flexible.', 'elementor' );
	}

	public function get_fix_hint(): string {
		return esc_html__( 'Use the Container Converter to replace each section/column with a container.', 'elementor' );
	}

	public function get_fix_plugins(): array {
		return [];
	}

	public function get_categories(): array {
		return [ self::CATEGORY_HEALTH, self::CATEGORY_PERFORMANCE ];
	}

	public function get_severity(): string {
		return self::SEVERITY_WARNING;
	}

	public function get_weight(): int {
		return 7;
	}
}
