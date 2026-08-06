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
use Elementor\Modules\Interactions\Module as Interactions_Module;
use Elementor\Modules\Mcp\Abilities\Appliers\Class_Applier;
use Elementor\Modules\Mcp\Abilities\Appliers\Element_Config_Applier;
use Elementor\Modules\Mcp\Abilities\Appliers\Interactions_Applier;
use Elementor\Modules\Mcp\Abilities\Appliers\Style_Applier;
use Elementor\Modules\Mcp\Abilities\Build_Composition\Form_Structure_Validator;
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

final class Composition_Compiler {

	private const DEFAULT_PARENT_ID = 'document';
	private const DOCUMENT_ROOT_WRAPPER = 'e-div-block';
	private const COMPONENT_INSTANCE_WIDGET_TYPE = 'e-component';

	public const COMPONENT_PARENT_ID = 'component';

	public static function make(): self {
		return new self();
	}

	/**
	 * @param array     $input         Composition input using the `elementor/build-composition` shapes.
	 * @param ?Document $document      Context for resolving dynamic values, when a target document exists.
	 * @param array     $document_tree Existing document tree used for insertion-context validation.
	 * @param string    $parent_id     Target parent used for insertion-context validation.
	 *
	 * @return array{elements: array[], warnings: string[], dom: \DOMDocument, xml_parser: Xml_Parser}|\WP_Error
	 */
	public function compile(
		array $input,
		?Document $document = null,
		array $document_tree = [],
		string $parent_id = self::DEFAULT_PARENT_ID
	) {
		$xml_parser = new Xml_Parser();
		$type_resolver = new Widget_Type_Resolver( $xml_parser );
		$subtree_builder = new Subtree_Builder( $xml_parser );

		$dom = $xml_parser->parse( (string) ( $input['xml_structure'] ?? '' ) );
		if ( is_wp_error( $dom ) ) {
			return $dom;
		}

		$form_structure_error = ( new Form_Structure_Validator( $xml_parser ) )->validate(
			$dom,
			$document_tree,
			$parent_id
		);
		if ( $form_structure_error ) {
			return $form_structure_error;
		}

		$widget_configs = $type_resolver->collect_used( $dom );
		if ( is_wp_error( $widget_configs ) ) {
			return $widget_configs;
		}

		$wrapping_result = $this->wrap_document_root_content( $dom, $widget_configs, $parent_id, $type_resolver, $xml_parser );
		if ( is_wp_error( $wrapping_result ) ) {
			return $wrapping_result;
		}

		$widget_configs = $wrapping_result['widget_configs'];

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
		$config_result = $config_applier->apply( $index, $this->as_map( $input['element_config'] ?? [] ), $widget_configs, $document );
		if ( $config_result['error'] ) {
			return $config_result['error'];
		}

		$class_applier = new Class_Applier( $this->create_global_classes_repository() );
		$class_error = $class_applier->apply( $index, $this->as_map( $input['classes'] ?? [] ) );
		if ( $class_error ) {
			return $class_error;
		}

		$style_applier = new Style_Applier( $this->create_css_converter( $variables_service ) );
		$style_result = $style_applier->apply( $index, $this->as_map( $input['style'] ?? [] ), $this->element_types_from_index( $index ) );
		if ( $style_result['error'] ) {
			return $style_result['error'];
		}

		$interactions_result = $this->apply_interactions( $index, $this->as_map( $input['interactions'] ?? [] ) );
		if ( $interactions_result['error'] ) {
			return $interactions_result['error'];
		}

		return [
			'elements' => $subtrees,
			'warnings' => array_merge( $wrapping_result['warnings'], $config_result['warnings'], $style_result['warnings'], $interactions_result['warnings'] ),
			'dom' => $dom,
			'xml_parser' => $xml_parser,
		];
	}

	private function wrap_document_root_content(
		\DOMDocument $dom,
		array $widget_configs,
		string $parent_id,
		Widget_Type_Resolver $type_resolver,
		Xml_Parser $xml_parser
	) {
		if ( self::DEFAULT_PARENT_ID !== $parent_id ) {
			return [
				'widget_configs' => $widget_configs,
				'warnings' => [],
			];
		}

		$root = $xml_parser->get_root( $dom );
		if ( ! $root ) {
			return [
				'widget_configs' => $widget_configs,
				'warnings' => [],
			];
		}

		$root_children = $xml_parser->get_child_elements( $root );
		$has_widget = false;
		foreach ( $root_children as $child ) {
			$tag = $xml_parser->get_tag_name( $child );
			$config = $widget_configs[ $tag ] ?? [];

			if ( 'widget' !== ( $config['elType'] ?? null ) ) {
				continue;
			}

			if ( self::COMPONENT_INSTANCE_WIDGET_TYPE === ( $config['widgetType'] ?? null ) ) {
				continue;
			}

			$has_widget = true;
			break;
		}

		if ( ! $has_widget ) {
			return [
				'widget_configs' => $widget_configs,
				'warnings' => [],
			];
		}

		$wrapper_config = $type_resolver->resolve_type_config( self::DOCUMENT_ROOT_WRAPPER );
		if ( is_wp_error( $wrapper_config ) ) {
			return $wrapper_config;
		}

		$widget_configs[ self::DOCUMENT_ROOT_WRAPPER ] = $wrapper_config;

		$wrapper = $dom->createElement( self::DOCUMENT_ROOT_WRAPPER );
		$root->appendChild( $wrapper );

		foreach ( $root_children as $child ) {
			$wrapper->appendChild( $child );
		}

		return [
			'widget_configs' => $widget_configs,
			'warnings' => [ __( 'Direct document-root content was wrapped in an e-div-block element.', 'elementor' ) ],
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

	/**
	 * @param array<string, array&>            $index
	 * @param array<string, array<int, array>> $interactions
	 *
	 * @return array{error: \WP_Error|null, warnings: string[]}
	 */
	private function apply_interactions( array &$index, array $interactions ): array {
		if ( empty( $interactions ) ) {
			return [
				'error' => null,
				'warnings' => [],
			];
		}

		if ( ! Plugin::$instance->experiments->is_feature_active( Interactions_Module::EXPERIMENT_NAME ) ) {
			return [
				'error' => null,
				'warnings' => [ __( 'Interactions experiment is not active. Interactions were not applied.', 'elementor' ) ],
			];
		}

		$applier = new Interactions_Applier( $this->get_plain_values_resolver() );

		return $applier->apply( $index, $interactions );
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
