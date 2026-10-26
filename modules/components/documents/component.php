<?php
namespace Elementor\Modules\Components\Documents;

use Elementor\Core\Base\Document;
use Elementor\Core\Utils\Api\Parse_Result;
use Elementor\Modules\Components\Components_REST_API;
use Elementor\Modules\Components\Components_Repository;
use Elementor\Modules\Components\ImportExport\Imported_Components_Registry;
use Elementor\Modules\Components\ImportExport\ImportStrategies\Import_Strategy_Factory;
use Elementor\Modules\Components\Module as Components_Module;
use Elementor\Modules\Components\OverridableProps\Component_Overridable_Props_Parser;
use Elementor\Modules\Components\PropTypes\Override_Prop_Type;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;
use Elementor\Modules\Components\Utils\Regenerate_Element_Ids;
use Elementor\Modules\Components\Utils\Remap_Component_Media;
use Elementor\Modules\Components\Utils\Remap_Overridable_Props_Component_Ids;
use Elementor\Modules\Components\Utils\Remap_Overridable_Props_Element_Ids;
use Elementor\Modules\Components\Utils\Remap_Overridable_Props_Origin_Element_Ids;
use Elementor\Modules\Components\Utils\Remap_Variants_Element_Ids;
use Elementor\Modules\Components\Variants\Component_Variants;
use Elementor\Modules\Components\Variants\Component_Variants_Parser;
use Elementor\Modules\Components\Widgets\Component_Instance;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Component extends Document {
	const TYPE = 'elementor_component';
	const COMPONENT_UID_META_KEY = '_elementor_component_uid';
	const OVERRIDABLE_PROPS_META_KEY = '_elementor_component_overridable_props';
	const VARIANTS_META_KEY = '_elementor_component_variants';
	const ARCHIVED_META_KEY = '_elementor_component_is_archived';
	const ARCHIVED_AT_META_KEY = '_elementor_component_archived_at';
	const EXPORT_SETTINGS_UID_KEY = 'uid';
	const EXPORT_SETTINGS_SOURCE_ID_KEY = 'source_id';
	const EXPORT_DEPENDENCIES_FILE_PATH = 'content/' . self::TYPE . '/dependencies';
	const COMPONENT_CUSTOM_META_KEYS = [
		self::COMPONENT_UID_META_KEY,
		self::OVERRIDABLE_PROPS_META_KEY,
		self::VARIANTS_META_KEY,
		self::ARCHIVED_META_KEY,
		self::ARCHIVED_AT_META_KEY,
	];

	public static function get_properties() {
		$properties = parent::get_properties();

		$properties['cpt'] = [ self::TYPE ];

		return $properties;
	}

	public static function get_type() {
		return self::TYPE;
	}

	public static function get_title() {
		return esc_html__( 'Component', 'elementor' );
	}

	public static function get_plural_title() {
		return esc_html__( 'Components', 'elementor' );
	}

	public static function get_labels(): array {
		$plural_label   = static::get_plural_title();
		$singular_label = static::get_title();

		$labels = [
			'name' => $plural_label,
			'singular_name' => $singular_label,
		];

		return $labels;
	}

	public static function get_supported_features(): array {
		return [
			'title',
			'author',
			'thumbnail',
			'custom-fields',
			'revisions',
			'elementor',
		];
	}

	public function get_component_uid() {
		return $this->get_meta( self::COMPONENT_UID_META_KEY );
	}

	public function get_overridable_props(): Component_Overridable_Props {
		$meta = $this->get_json_meta( self::OVERRIDABLE_PROPS_META_KEY );

		return Component_Overridable_Props::make( $meta ?? [] );
	}

	public function archive() {
		try {
			$this->update_json_meta( self::ARCHIVED_META_KEY, [
				'is_archived' => true,
				'archived_at' => time(),
			] );
		} catch ( \Exception $e ) {
			throw new \Exception( 'Failed to archive component: ' . esc_html( $e->getMessage() ) );
		}
	}

	public function get_is_archived(): bool {
		$archived_meta = $this->get_json_meta( self::ARCHIVED_META_KEY );

		return $archived_meta['is_archived'] ?? false;
	}

	public function update_overridable_props( $data ): Parse_Result {
		$parser = Component_Overridable_Props_Parser::make();

		$result = $parser->parse( $data );

		if ( ! $result->is_valid() ) {
			return $result;
		}

		$sanitized_data = $result->unwrap();

		$this->update_json_meta( self::OVERRIDABLE_PROPS_META_KEY, $sanitized_data );

		return $result;
	}

	public function get_variants(): Component_Variants {
		$meta = $this->get_json_meta( self::VARIANTS_META_KEY );

		return Component_Variants::make( $meta ?? [] );
	}

	public function update_variants( $data ): Parse_Result {
		$parser = Component_Variants_Parser::make();

		$result = $parser->parse( $data );

		if ( ! $result->is_valid() ) {
			return $result;
		}

		$sanitized_data = $result->unwrap();

		$this->update_json_meta( self::VARIANTS_META_KEY, $sanitized_data );

		return $result;
	}

	public function update_title( string $title ): bool {
		$sanitized_title = sanitize_text_field( $title );

		if ( empty( $sanitized_title ) ) {
			return false;
		}

		return $this->update_post_field( 'post_title', $sanitized_title );
	}

	public function update_status( string $status ): bool {
		if ( ! in_array( $status, [ Document::STATUS_PUBLISH, Document::STATUS_DRAFT, Document::STATUS_AUTOSAVE ], true ) ) {
			return false;
		}

		return $this->update_post_field( 'post_status', $status );
	}

	public function get_export_data() {
		$content = Plugin::$instance->db->iterate_data( $this->get_elements_data(), function ( $element_data ) {
			$element = Plugin::$instance->elements_manager->create_element_instance( $element_data );

			if ( ! $element ) {
				return null;
			}

			return $this->process_element_import_export( $element, 'on_export' );
		} );

		$settings = $this->get_data( 'settings' );
		$settings[ self::EXPORT_SETTINGS_UID_KEY ] = $this->get_component_uid();
		$settings[ self::EXPORT_SETTINGS_SOURCE_ID_KEY ] = $this->get_main_id();
		$settings['overridable_props'] = $this->get_overridable_props()->to_associative_array();

		$variants = $this->get_variants()->to_associative_array();

		if ( Components_Module::is_variants_experiment_active() || ! empty( $variants['variants'] ) ) {
			$settings['variants'] = $variants;
		}

		return [
			'content' => Remap_Component_Media::for_export( $content ),
			'settings' => Remap_Component_Media::for_export( $settings ),
			'metadata' => $this->get_export_metadata(),
		];
	}

	public function import( array $data ) {
		$this->assert_components_limit_not_reached();

		$record = [
			'id' => $this->get_main_id(),
			'uid' => $data['settings'][ self::EXPORT_SETTINGS_UID_KEY ] ?? '',
			'title' => $this->get_post()->post_title,
		];

		$source_id = (int) ( $data['settings'][ self::EXPORT_SETTINGS_SOURCE_ID_KEY ] ?? 0 );

		unset(
			$data['settings'][ self::EXPORT_SETTINGS_UID_KEY ],
			$data['settings'][ self::EXPORT_SETTINGS_SOURCE_ID_KEY ]
		);

		$data['content'] = Remap_Component_Media::for_import( $data['content'] ?? [] );
		$data['settings'] = Remap_Component_Media::for_import( $data['settings'] ?? [] );
		$data = $this->regenerate_imported_element_ids( $data, $source_id );

		parent::import( $data );

		$resolution = Import_Strategy_Factory::make()->resolve( $record );

		$this->update_meta( self::COMPONENT_UID_META_KEY, $resolution->get_uid() );

		if ( $resolution->get_title() !== $record['title'] ) {
			$this->update_title( $resolution->get_title() );
		}
	}

	public function on_import_update_settings( array $settings, array $config ): array {
		$settings = parent::on_import_update_settings( $settings, $config );

		if ( isset( $settings['overridable_props'] ) && is_array( $settings['overridable_props'] ) ) {
			$settings['overridable_props'] = Remap_Overridable_Props_Component_Ids::apply(
				$settings['overridable_props'],
				$config['component_ids'] ?? []
			);
		}

		return $settings;
	}

	private function regenerate_imported_element_ids( array $data, int $source_id ): array {
		$regenerated = Regenerate_Element_Ids::apply( $data['content'] ?? [] );
		$id_map = $regenerated['id_map'];

		$data['content'] = $regenerated['elements'];

		if ( isset( $data['settings']['overridable_props'] ) && is_array( $data['settings']['overridable_props'] ) ) {
			$overridable_props = Remap_Overridable_Props_Element_Ids::apply( $data['settings']['overridable_props'], $id_map );

			$data['settings']['overridable_props'] = Remap_Overridable_Props_Origin_Element_Ids::apply(
				$overridable_props,
				$data['content'],
				Imported_Components_Registry::get_overridable_props(),
				Imported_Components_Registry::get_element_id_maps()
			);
		}

		if ( isset( $data['settings']['variants'] ) && is_array( $data['settings']['variants'] ) ) {
			$data['settings']['variants'] = Remap_Variants_Element_Ids::apply( $data['settings']['variants'], $id_map );
		}

		if ( $source_id ) {
			Imported_Components_Registry::add( $source_id, $id_map, $data['settings']['overridable_props'] ?? [] );
		}

		return $data;
	}

	private function update_post_field( string $field, $value ): bool {
		if ( is_string( $value ) ) {
			// NOTE: escape the json to support non-UTF-8 characters
			$value = wp_slash( $value );
		}
		$result = wp_update_post( [
			'ID' => $this->post->ID,
			$field => $value,
		] );

		$success = ! is_wp_error( $result ) && $result > 0;

		if ( $success ) {
			$this->refresh_post();
		}

		return $success;
	}

	private function assert_components_limit_not_reached(): void {
		$count = Components_Repository::make()
			->all()
			->filter(
				fn( array $component ) => ! $component['is_archived'] && $component['id'] !== $this->get_main_id()
			)
			->count();

		if ( $count < Components_REST_API::MAX_COMPONENTS ) {
			return;
		}

		$this->force_delete();

		throw new \Exception( esc_html__( 'Maximum number of components exceeded.', 'elementor' ) );
	}

	public function print_elements_without_cache( array $elements_data ) {
		$this->do_print_elements( $elements_data );
	}

	public function align_overridable_props_with_elements() {
		$elements_data = $this->get_elements_data();
		// format elements data to flat map of overridable prop key -> new origin value
		$overridable_props_map = $this->get_elements_origin_values_map( $elements_data, [] );

		if ( empty( $overridable_props_map ) ) {
			return;
		}

		$updated_overridable_props = $this->get_overridable_props();

		foreach ( $updated_overridable_props->props as $prop ) {

			$new_origin_value = $overridable_props_map[ $prop->override_key ];

			if ( isset( $new_origin_value ) ) {
				$prop->origin_value = $new_origin_value;
			}
		}

		$this->update_overridable_props( $updated_overridable_props->to_associative_array() );
	}

	private function get_elements_origin_values_map( array $elements_data, array $overridable_props_map ) {
		foreach ( $elements_data as $element ) {
			if ( $this->is_component_instance( $element ) ) {
				$component_instance = $element['settings']['component_instance']['value'];
				$overrides = $component_instance['overrides']['value'] ?? [];

				if ( empty( $overrides ) ) {
					continue;
				}

				foreach ( $overrides as $item ) {
					if ( $this->is_overridable_prop( $item ) ) {
						$override_key = $item['value']['override_key'];
						$override = $item['value']['origin_value'];

						if ( ! $this->is_override_prop( $override ) ) {
							throw new \Exception( 'Invalid override value' );
						}
						$overridable_props_map[ $override_key ] = $override['value']['override_value'];
					}
				}

				continue;
			}

			if ( ! empty( $element['settings'] ) ) {
				foreach ( $element['settings'] as $prop_key => $prop_value ) {
					if ( isset( $prop_value['$$type'] ) && Overridable_Prop_Type::get_key() === $prop_value['$$type'] ) {
						$override_key = $prop_value['value']['override_key'];
						$origin_value = $prop_value['value']['origin_value'];

						$overridable_props_map[ $override_key ] = $origin_value;
					}
				}
			}

			if ( is_array( $element['elements'] ) ) {
				$overridable_props_map = $this->get_elements_origin_values_map( $element['elements'], $overridable_props_map );
			}
		}

		return $overridable_props_map;
	}

	private function is_overridable_prop( array $prop ): bool {
		return isset( $prop['$$type'] ) && Overridable_Prop_Type::get_key() === $prop['$$type'];
	}

	private function is_override_prop( array $prop ): bool {
		return isset( $prop['$$type'] ) && Override_Prop_Type::get_key() === $prop['$$type'];
	}

	private function is_component_instance( array $element ): bool {
		return 'widget' === $element['elType'] && Component_Instance::get_element_type() === $element['widgetType'];
	}
}
