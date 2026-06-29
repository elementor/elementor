<?php
namespace Elementor\Modules\Components\Widgets;

use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Has_Template;
use Elementor\Modules\AtomicWidgets\PropsResolver\Render_Props_Resolver;
use Elementor\Modules\Components\Components_Repository;
use Elementor\Modules\Components\PropTypes\Component_Instance_Prop_Type;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;
use Elementor\Modules\Components\Transformers\Overridable_Transformer;
use Elementor\Modules\Components\Utils\Format_Component_Elements_Id;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Component_Instance extends Atomic_Widget_Base {
	use Has_Template;

	public static function get_element_type(): string {
		return 'e-component';
	}

	public function show_in_panel() {
		return false;
	}

	public function get_title() {
		return esc_html__( 'Component', 'elementor' );
	}

	public function get_keywords() {
		return [ 'component' ];
	}

	public function get_icon() {
		return 'eicon-components';
	}

	protected static function define_props_schema(): array {
		return [
			'component_instance' => Component_Instance_Prop_Type::make()->meta( Overridable_Prop_Type::ignore() )->required(),
		];
	}

	protected function parse_editor_settings( array $data ): array {
		$editor_data = parent::parse_editor_settings( $data );

		if ( isset( $data['component_uid'] ) && is_string( $data['component_uid'] ) ) {
			$editor_data['component_uid'] = sanitize_text_field( $data['component_uid'] );
		}

		return $editor_data;
	}

	protected function define_atomic_controls(): array {
		return [];
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/component' => __DIR__ . '/component.html.twig',
		];
	}

	protected function define_render_context(): array {
		$resolved_overrides = $this->get_resolved_overrides();
		$merged_overrides = $this->get_merged_overrides( $resolved_overrides );

		return [
			[
				'context_key' => Overridable_Transformer::class,
				'context' => [ 'overrides' => $merged_overrides ],
			],
			[
				'context' => [ 'instance_id' => $this->get_id() ],
			],
		];
	}

	private function get_resolved_overrides(): array {
		$props = $this->get_settings();
		$overrides = $props['component_instance']['value']['overrides'] ?? null;

		if ( ! $overrides ) {
			return [];
		}

		$component_schema = $this->get_props_schema();
		$overrides_schema = $component_schema['component_instance']->get_shape_field( 'overrides' );

		return Render_Props_Resolver::for_settings()->resolve( [ 'overrides' => $overrides_schema ], [ 'overrides' => $overrides ] );
	}

	private function get_merged_overrides( $value ): array {
		$overrides_array = $value['overrides'] ?? [];
		$overrides = [];

		foreach ( $overrides_array as $override ) {
			$overrides[ $override['override_key'] ] = $override['override_value'];
		}

		return $overrides;
	}

	public function get_inner_elements_data_for_search(): array {
		$component_id = $this->get_component_id();

		if ( null === $component_id ) {
			return [];
		}

		$repository = new Components_Repository();
		$component = $repository->get( $component_id );

		if ( ! $component ) {
			return [];
		}

		$elements_data = $component->get_elements_data();

		return Format_Component_Elements_Id::format( $elements_data, [ $this->get_id() ] );
	}

	private function get_component_id(): ?int {
		$settings = $this->get_settings();

		if ( ! isset( $settings['component_instance']['value']['component_id']['value'] ) ) {
			return null;
		}

		return (int) $settings['component_instance']['value']['component_id']['value'];
	}
}
