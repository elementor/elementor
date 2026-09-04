<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Carousel;

use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Has_Element_Template;
use Elementor\Modules\AtomicWidgets\Elements\Base\Html_Tag_Computer;
use Elementor\Modules\AtomicWidgets\Elements\Promotions\Preserves_Children_Subtree;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Carousel_Promotion extends Atomic_Element_Base {
	use Has_Element_Template;
	use Preserves_Children_Subtree;

	const BASE_STYLE_KEY = 'base';

	// Provisional go links — pending marketing (epic ED-25236 open question 9).
	const CANVAS_UPGRADE_URL = 'https://go.elementor.com/go-pro-carousel-canvas-upgrade/';
	const MODAL_UPGRADE_URL = 'https://go.elementor.com/go-pro-carousel-modal/';
	const SECTION_UPGRADE_URL = 'https://go.elementor.com/go-pro-carousel-section/';

	public function __construct( $data = [], $args = null ) {
		parent::__construct( $data, $args );
		$this->meta( 'is_container', true );
		$this->meta( 'is_pro_promotion', true );
		// Do not set is_compound: Pro Atomic_Carousel only sets is_container. That flag
		// drives isCompoundAtomicType() wrap-in-flexbox, which the real element does not use.
	}

	public static function get_type() {
		return 'e-carousel';
	}

	public static function get_element_type(): string {
		return self::get_type();
	}

	public function get_title() {
		return esc_html__( 'Carousel', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-nested-carousel';
	}

	public static function get_computed_html_tag( array $settings ): string {
		return Html_Tag_Computer::compute( $settings, 'div' );
	}

	protected static function define_props_schema(): array {
		return [
			'classes' => Classes_Prop_Type::make()
				->default( [] ),
		];
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

	protected function get_templates(): array {
		return [
			'elementor/elements/carousel-promotion' => __DIR__ . '/carousel-promotion.html.twig',
		];
	}

	protected function build_template_context(): array {
		return array_merge(
			parent::build_template_context(),
			[
				'upgrade_url' => self::CANVAS_UPGRADE_URL,
			]
		);
	}
}
