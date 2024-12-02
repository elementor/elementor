<?php
namespace Elementor\Modules\AtomicWidgets\Widgets;

use Elementor\Modules\AtomicWidgets\Base\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Container extends Atomic_Element_Base {
	public static function get_type() {
		return 'a-container';
	}

	public function get_name() {
		return 'a-container';
	}

	public function get_title() {
		return esc_html__( 'Atomic Container', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-container';
	}

	protected function define_atomic_controls(): array {
		return [];
	}

	protected static function define_props_schema(): array {
		return [
			'classes' => Classes_Prop_Type::make()
				->default( [] ),
		];
	}

	protected function _get_default_child_type( array $element_data ) {
		if ( 'a-container' === $element_data['elType'] ) {
			return Plugin::$instance->elements_manager->get_element_types( 'a-container' );
		}
		
		return Plugin::$instance->widgets_manager->get_widget_types( $element_data['widgetType'] );
	}

	protected function content_template() {
		?>
		<?php
	}
}
