<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Promotions;

use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Has_Element_Template;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class Atomic_Pro_Promotion_Element_Base extends Atomic_Element_Base {
	use Has_Element_Template;
	use Preserves_Children_Subtree;

	const BASE_STYLE_KEY = 'base';

	public function __construct( $data = [], $args = null ) {
		parent::__construct( $data, $args );
		$this->register_pro_promotion_meta();
	}

	protected function register_pro_promotion_meta(): void {
		$this->meta( 'is_container', true );
		$this->meta( 'is_pro_promotion', true );
		$this->meta( 'llm_support', false );

		if ( $this->uses_compound_container_meta() ) {
			$this->meta( 'is_compound', true );
		}
	}

	protected function uses_compound_container_meta(): bool {
		return false;
	}

	protected function define_atomic_controls(): array {
		return [];
	}

	protected function define_base_styles(): array {
		return [
			static::BASE_STYLE_KEY => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_prop( 'display', String_Prop_Type::generate( 'block' ) )
				),
		];
	}

	protected function should_show_in_panel() {
		return false;
	}

	protected function should_print_empty() {
		return false;
	}

	public function print_content() {
	}
}
