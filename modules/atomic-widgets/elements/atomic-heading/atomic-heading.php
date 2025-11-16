<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Heading;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Link_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Select_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Textarea_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Inline_Editing_Control;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Elements\Has_Template;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Html_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Link_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use Elementor\Modules\AtomicWidgets\Controls\Types\Text_Control;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Heading extends Atomic_Widget_Base {
	use Has_Template;

	const LINK_BASE_STYLE_KEY = 'link-base';

	public static function get_element_type(): string {
		return 'e-heading';
	}

	public function get_title() {
		return esc_html__( 'Heading', 'elementor' );
	}

	public function get_keywords() {
		return [ 'ato', 'atom', 'atoms', 'atomic' ];
	}

	public function get_icon() {
		return 'eicon-e-heading';
	}

	protected static function define_props_schema(): array {
		$is_feature_active = Plugin::$instance->experiments->is_feature_active( Atomic_Widgets_Module::EXPERIMENT_INLINE_EDITING );

		$title_prop = $is_feature_active
			? Html_Prop_Type::make()->default( __( 'This is a title', 'elementor' ) )
			: String_Prop_Type::make()->default( __( 'This is a title', 'elementor' ) );

		$props = [
			'classes' => Classes_Prop_Type::make()
				->default( [] ),

			'tag' => String_Prop_Type::make()
				->enum( [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ] )
				->default( 'h2' ),

			'title' => $title_prop,

			'link' => Link_Prop_Type::make(),

			'attributes' => Attributes_Prop_Type::make(),
		];

		return $props;
	}

	protected function define_atomic_controls(): array {
		$is_feature_active = Plugin::$instance->experiments->is_feature_active( Atomic_Widgets_Module::EXPERIMENT_INLINE_EDITING );

		$control = $is_feature_active
			? Inline_Editing_Control::bind_to( 'title' )
				->set_placeholder( __( 'Type your title here', 'elementor' ) )
				->set_label( __( 'Title', 'elementor' ) )
			: Textarea_Control::bind_to( 'title' )
				->set_placeholder( __( 'Type your title here', 'elementor' ) )
				->set_label( __( 'Title', 'elementor' ) );

		$content_section = Section::make()
			->set_label( __( 'Content', 'elementor' ) )
			->set_items( [ $control ] );
		return [
			$content_section,
			Section::make()
				->set_label( __( 'Settings', 'elementor' ) )
				->set_id( 'settings' )
				->set_items( $this->get_settings_controls() ),
		];
	}

	protected function get_settings_controls(): array {
		return [
			Select_Control::bind_to( 'tag' )
				->set_options([
					[
						'value' => 'h1',
						'label' => 'H1',
					],
					[
						'value' => 'h2',
						'label' => 'H2',
					],
					[
						'value' => 'h3',
						'label' => 'H3',
					],
					[
						'value' => 'h4',
						'label' => 'H4',
					],
					[
						'value' => 'h5',
						'label' => 'H5',
					],
					[
						'value' => 'h6',
						'label' => 'H6',
					],
				])
				->set_label( __( 'Tag', 'elementor' ) ),
			Link_Control::bind_to( 'link' )
				->set_placeholder( __( 'Type or paste your URL', 'elementor' ) )
				->set_label( __( 'Link', 'elementor' ) )
				->set_meta( [
					'topDivider' => true,
				] ),
			Text_Control::bind_to( '_cssid' )
			->set_label( __( 'ID', 'elementor' ) )
			->set_meta( $this->get_css_id_control_meta() ),
		];
	}

	protected function define_base_styles(): array {
		$margin_value = Size_Prop_Type::generate( [
			'unit' => 'px',
			'size' => 0 ,
		] );

		return [
			'base' => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_prop( 'margin', $margin_value )
				),
			self::LINK_BASE_STYLE_KEY => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_prop( 'all', 'unset' )
						->add_prop( 'cursor', 'pointer' )
				),
		];
	}

	public function get_script_depends() {
		return [ 'elementor-heading-action-handler' ];
	}

	public function register_frontend_handlers() {
		$min_suffix = ( \Elementor\Utils::is_script_debug() || \Elementor\Utils::is_elementor_tests() ) ? '' : '.min';

		wp_register_script(
			'elementor-heading-action-handler',
			ELEMENTOR_URL . 'modules/atomic-widgets/elements/atomic-heading/atomic-heading-handler' . $min_suffix . '.js',
			[ 'elementor-frontend' ],
			ELEMENTOR_VERSION,
			true
		);
	}

	protected function has_action_in_link(): bool {
		$raw_settings = $this->get_settings();
		$link = $raw_settings['link'] ?? null;

		if ( ! is_array( $link ) || ! isset( $link['value']['destination'] ) ) {
			return false;
		}

		$destination = $link['value']['destination'];

		if ( ! isset( $destination['$$type'] ) || $destination['$$type'] !== 'dynamic' ) {
			return false;
		}

		$dynamic_tag_name = $destination['value']['name'] ?? '';
		$dynamic_tag_settings = $destination['value']['settings'] ?? [];

		if ( isset( $dynamic_tag_settings['action'] ) ) {
			return true;
		}

		$action_based_tags = [ 'popup' ];
		return in_array( $dynamic_tag_name, $action_based_tags, true );
	}

	protected function render() {
		try {
			$renderer = \Elementor\Modules\AtomicWidgets\TemplateRenderer\Template_Renderer::instance();

			foreach ( $this->get_templates() as $name => $path ) {
				if ( $renderer->is_registered( $name ) ) {
					continue;
				}

				$renderer->register( $name, $path );
			}

			$context = [
				'id' => $this->get_id(),
				'type' => $this->get_name(),
				'settings' => $this->get_atomic_settings(),
				'base_styles' => $this->get_base_styles_dictionary(),
				'interactions' => $this->get_interactions_ids(),
				'has_action_in_link' => $this->has_action_in_link(),
			];

			echo $renderer->render( $this->get_main_template(), $context );
		} catch ( \Exception $e ) {
			if ( \Elementor\Utils::is_elementor_debug() ) {
				throw $e;
			}
		}
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/atomic-heading' => __DIR__ . '/atomic-heading.html.twig',
		];
	}
}
