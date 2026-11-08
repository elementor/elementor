<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Menu\Atomic_Menu_Item;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Link_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Text_Control;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Menu\Base\Atomic_Menu_Locked_Element;
use Elementor\Modules\AtomicWidgets\Elements\Base\Html_Tag_Computer;
use Elementor\Modules\AtomicWidgets\PropTypes\Link_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Menu_Item extends Atomic_Menu_Locked_Element {
	public static function get_type() {
		return 'e-menu-item';
	}

	public function get_title() {
		return esc_html__( 'Menu item', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-nav-menu';
	}

	public static function get_computed_html_tag( array $settings ): string {
		return Html_Tag_Computer::compute( $settings, 'span' );
	}

	protected static function define_props_schema(): array {
		return array_merge( parent::define_props_schema(), [
			'link' => Link_Prop_Type::make(),
		] );
	}

	protected function define_atomic_controls(): array {
		return [
			Section::make()
				->set_label( __( 'Settings', 'elementor' ) )
				->set_id( 'settings' )
				->set_items( [
					Link_Control::bind_to( 'link' )
						->set_placeholder( __( 'Type or paste your URL', 'elementor' ) )
						->set_label( __( 'Link', 'elementor' ) ),
					Text_Control::bind_to( '_cssid' )
						->set_label( __( 'ID', 'elementor' ) )
						->set_meta( $this->get_css_id_control_meta() ),
				] ),
		];
	}
}
