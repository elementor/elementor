<?php

namespace Elementor\Modules\AtomicWidgets\Elements\AtomicBlock;

use Elementor\Core\Elements\Atomic_Element;
use Elementor\Modules\AtomicWidgets\Controls\Types\Link_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Text_Control;
use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Select_Control;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Link_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Block extends Atomic_Element {
	const BASE_STYLE_KEY = 'base';

	public static function get_type() {
		return 'e-block';
	}

	public function get_title() {
		return esc_html__( 'Atomic Block', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-div-block';
	}

	protected function define_atomic_settings_schema(): array {
		return [
			'classes' => Classes_Prop_Type::make()->default( [] ),

			'tag' => String_Prop_Type::make()
				->enum( [ 'div', 'header', 'section', 'article', 'aside', 'footer' ] )
				->default( 'div' ),

			'link' => Link_Prop_Type::make(),

			'_cssid' => String_Prop_Type::make(),
		];
	}

	protected function define_atomic_settings_controls(): array {
		return [
			Section::make()
				->set_label( __( 'Settings', 'elementor' ) )
				->set_items( [
					Select_Control::bind_to( 'tag' )
						->set_label( esc_html__( 'HTML Tag', 'elementor' ) )
						->set_options( [
							[
								'value' => 'div',
								'label' => 'Div',
							],
							[
								'value' => 'header',
								'label' => 'Header',
							],
							[
								'value' => 'section',
								'label' => 'Section',
							],
							[
								'value' => 'article',
								'label' => 'Article',
							],
							[
								'value' => 'aside',
								'label' => 'Aside',
							],
							[
								'value' => 'footer',
								'label' => 'Footer',
							],
						]),

					Link_Control::bind_to( 'link' ),

					Text_Control::bind_to( '_cssid' )
						->set_label( __( 'ID', 'elementor' ) )
						->set_meta( [
							'layout' => 'two-columns',
							'topDivider' => true,
						] ),
				] ),
		];
	}

	protected function define_base_styles(): array {
		return [
			static::BASE_STYLE_KEY => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_prop( 'display', String_Prop_Type::generate( 'block' ) )
						->add_prop( 'padding', Size_Prop_Type::generate( [
							'size' => 10,
							'unit' => 'px',
						] ) )
						->add_prop( 'min-width', Size_Prop_Type::generate( [
							'size' => 30,
							'unit' => 'px',
						] ) )
				),
		];
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/atomic-block' => __DIR__ . '/atomic-block.html.twig',
		];
	}
}
