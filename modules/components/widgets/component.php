<?php
namespace Elementor\Modules\Components\Widgets;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Text_Control;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Overrides_Value_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Component extends Atomic_Widget_Base {

	public static function get_element_type(): string {
		return 'e-component';
	}

	public function show_in_panel() {
		return false;
	}

	public function get_title() {
		$title = esc_html__( 'Component', 'elementor' );

		if ( isset( $this->get_settings ) && null !== $this->get_settings( 'component_id' ) ) {
			$post_id = $this->get_settings( 'component_id' )['value'];
			$title   = Plugin::$instance->documents->get( $post_id )->get_title();
		}

		return $title;
	}

	public function get_keywords() {
		return [ 'component' ];
	}

	public function get_icon() {
		return 'eicon-star';
	}

	protected static function define_props_schema(): array {
		return [
			'component_id' => Number_Prop_Type::make(),
			'__title' => Union_Prop_Type::create_from( String_Prop_Type::make() )
				->add_prop_type( Overrides_Value_Prop_Type::make() ),
//			'overrides' => OverridesPropType::make(), // Something like that!!
		];
	}

	protected function define_atomic_controls(): array {
		return [
			Section::make()
				->set_label( __( 'Content', 'elementor' ) )
				->set_items( [
					Text_Control::bind_to( '__title' )
						->set_label( esc_html__( 'Title', 'elementor' ) )
						->set_description( esc_html__( 'Enter a title for this component', 'elementor' ) ),
//					OverriedsControls::bind_to('overrides'), // Here it is!!
				] ),
		];
	}

	protected function content_template() {
		?>
		<?php
	}

	protected function render(): void {
		if ( null === $this->get_settings( 'component_id' ) ) {
			return;
		}

		$post_id = $this->get_settings( 'component_id' )['value'];
		$content = Plugin::$instance->frontend->get_builder_content( $post_id );
		$html    = sprintf( '<div class="e-component">%s</div>', $content );

		// PHPCS - should not be escaped.
		echo $html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}
}
