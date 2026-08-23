<?php
namespace Elementor_Example_Plugin\Widgets;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Select_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Text_Control;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Has_Template;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor_Example_Plugin\PropTypes\Badge_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Atomic_Greeting_Widget extends Atomic_Widget_Base {

	use Has_Template;

	public static function get_element_type(): string {
		return 'e-example-greeting';
	}

	public function get_title() {
		return esc_html__( 'Example Greeting', 'elementor-example-plugin' );
	}

	public function get_icon() {
		return 'eicon-heading';
	}

	protected static function define_props_schema(): array {
		return [
			'classes' => Classes_Prop_Type::make()->default( [] ),
			'title' => String_Prop_Type::make()->default( 'Hello' ),
			'badge' => Badge_Prop_Type::make()->default( 'featured' ),
			'attributes' => Attributes_Prop_Type::make()->meta( Overridable_Prop_Type::ignore() ),
		];
	}

	protected function define_atomic_controls(): array {
		return [
			Section::make()
				->set_label( __( 'Content', 'elementor-example-plugin' ) )
				->set_id( 'content' )
				->set_items( [
					Text_Control::bind_to( 'title' )
						->set_label( __( 'Title', 'elementor-example-plugin' ) ),
					Select_Control::bind_to( 'badge' )
						->set_label( __( 'Badge', 'elementor-example-plugin' ) )
						->set_options( [
							'new' => __( 'New', 'elementor-example-plugin' ),
							'featured' => __( 'Featured', 'elementor-example-plugin' ),
							'sale' => __( 'Sale', 'elementor-example-plugin' ),
						] ),
				] ),
		];
	}

	protected function define_base_styles(): array {
		return [
			'base' => Style_Definition::make()
				->add_variant( Style_Variant::make() ),
		];
	}

	protected function get_templates(): array {
		return [
			'elementor-example-plugin/greeting' => __DIR__ . '/templates/greeting.html.twig',
		];
	}
}
