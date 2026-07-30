<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Core\Base\Document;
use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry_Factory;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Expander_Registry_Factory;
use Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Null_Failure_Reporter;
use Elementor\Modules\AtomicWidgets\CssConverter\Variable_Prop_Value_Transformer;
use Elementor\Modules\AtomicWidgets\Module as AtomicWidgetsModule;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Values_Resolver;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\Mcp\Abilities\Appliers\Class_Applier;
use Elementor\Modules\Mcp\Abilities\Appliers\Element_Config_Applier;
use Elementor\Modules\Mcp\Abilities\Appliers\Style_Applier;
use Elementor\Modules\Mcp\Abilities\Build_Composition\Subtree_Builder;
use Elementor\Modules\Mcp\Abilities\Build_Composition\Widget_Type_Resolver;
use Elementor\Modules\Mcp\Abilities\Build_Composition\Xml_Parser;
use Elementor\Modules\Variables\Module as Variables_Module;
use Elementor\Modules\Variables\Services\Batch_Operations\Batch_Processor;
use Elementor\Modules\Variables\Services\Variables_Service;
use Elementor\Modules\Variables\Storage\Variables_Repository;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Compiles the `xml_structure` tag language into an element tree, by consuming the same public
 * parsing and applier building blocks that back `elementor/build-composition`.
 *
 * Intentionally separate from `Build_Composition_Ability`, which keeps its own orchestration and
 * the concerns components have no use for: interactions and document persistence.
 */
final class Composition_Compiler {

	public static function make(): self {
		return new self();
	}

	/**
	 * @param string    $xml_structure  Raw XML tags, same language as `elementor/build-composition`.
	 * @param mixed     $element_config Record mapping configuration-id → plain widget settings.
	 * @param mixed     $classes        Record mapping configuration-id → global class labels.
	 * @param mixed     $style          Record mapping configuration-id → raw CSS declarations.
	 * @param ?Document $document       Context for resolving dynamic values, when a target document exists.
	 *
	 * @return array{elements: array[], warnings: string[]}|\WP_Error
	 */
	public function compile( string $xml_structure, $element_config = [], $classes = [], $style = [], ?Document $document = null ) {
		$xml_parser = new Xml_Parser();
		$type_resolver = new Widget_Type_Resolver( $xml_parser );
		$subtree_builder = new Subtree_Builder( $xml_parser );

		$dom = $xml_parser->parse( $xml_structure );
		if ( is_wp_error( $dom ) ) {
			return $dom;
		}

		$widget_configs = $type_resolver->collect_used( $dom );
		if ( is_wp_error( $widget_configs ) ) {
			return $widget_configs;
		}

		$child_type_error = $type_resolver->validate_child_types( $dom, $widget_configs );
		if ( $child_type_error ) {
			return $child_type_error;
		}

		$subtrees = $subtree_builder->build( $dom, $widget_configs );
		if ( empty( $subtrees ) ) {
			return new \WP_Error(
				'empty_composition',
				__( 'xml_structure did not contain any elements. Pass raw XML tags (e.g. <e-flexbox configuration-id="..."></e-flexbox>) — do not wrap the value in <![CDATA[...]]> or other text-only content.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		$index = $subtree_builder->index_by_config_id( $subtrees, $dom );

		$variables_service = $this->create_variables_service();

		$config_applier = new Element_Config_Applier( $type_resolver, $this->get_plain_values_resolver() );
		$config_result = $config_applier->apply( $index, $this->as_map( $element_config ), $widget_configs, $document );
		if ( $config_result['error'] ) {
			return $config_result['error'];
		}

		$class_applier = new Class_Applier( $this->create_global_classes_repository() );
		$class_error = $class_applier->apply( $index, $this->as_map( $classes ) );
		if ( $class_error ) {
			return $class_error;
		}

		$style_applier = new Style_Applier( $this->create_css_converter( $variables_service ) );
		$style_result = $style_applier->apply( $index, $this->as_map( $style ), $this->element_types_from_index( $index ) );
		if ( $style_result['error'] ) {
			return $style_result['error'];
		}

		return [
			'elements' => $subtrees,
			'warnings' => array_merge( $config_result['warnings'], $style_result['warnings'] ),
		];
	}

	private function as_map( $value ): array {
		if ( is_object( $value ) ) {
			$value = (array) $value;
		}

		return is_array( $value ) ? $value : [];
	}

	private function element_types_from_index( array $index ): array {
		$element_types = [];

		foreach ( $index as $config_id => $node ) {
			$element_type = $node['widgetType'] ?? $node['elType'] ?? null;

			if ( is_string( $element_type ) && '' !== $element_type ) {
				$element_types[ $config_id ] = $element_type;
			}
		}

		return $element_types;
	}

	private function create_css_converter( ?Variables_Service $variables_service ): Css_Converter {
		$variable_transformer = $variables_service
			? new Variable_Prop_Value_Transformer( $variables_service )
			: null;

		return new Css_Converter(
			Converter_Registry_Factory::create( $variables_service ),
			new Null_Failure_Reporter(),
			Expander_Registry_Factory::create( $variables_service ),
			$variable_transformer
		);
	}

	private function create_variables_service(): ?Variables_Service {
		if ( ! $this->is_variables_active() ) {
			return null;
		}

		$kit = Plugin::$instance->kits_manager->get_active_kit();

		if ( ! $kit ) {
			return null;
		}

		return new Variables_Service(
			new Variables_Repository( $kit ),
			new Batch_Processor()
		);
	}

	private function get_plain_values_resolver(): Plain_Values_Resolver {
		return AtomicWidgetsModule::instance()->get_settings_plain_values_resolver();
	}

	private function is_variables_active(): bool {
		$experiments = Plugin::$instance->experiments;

		return $experiments->is_feature_active( Variables_Module::EXPERIMENT_NAME )
			&& $experiments->is_feature_active( AtomicWidgetsModule::EXPERIMENT_NAME );
	}

	private function create_global_classes_repository(): Global_Classes_Repository {
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		return Global_Classes_Repository::make( $kit );
	}
}
