<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers;

use Elementor\Modules\AtomicWidgets\Elements\Base\Widget_Markers;
use Elementor\Modules\CompositeWidgets\Definitions\Widget_Definition;
use Elementor\Modules\CompositeWidgets\Definitions\Widgets_Definitions_Registry;
use Elementor\Modules\CompositeWidgets\Instance\Widget_Instance_Factory;
use Elementor\Modules\CompositeWidgets\Site\Site_Widgets_Access_Controller;
use Elementor\Modules\Mcp\Abilities\Utils\Editor_Settings;
use Elementor\Modules\Mcp\Abilities\Utils\Site_Widgets_Pro_Features_Discovery;
use Elementor\Modules\Mcp\Abilities\Utils\Warnings_Bag;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Expands each `<e-widget>` placeholder into an instance of its composite widget definition, and indexes the
 * instance's parts as `<configuration-id>.<part>`, so the other appliers configure each part with its own schema.
 */
class Widget_Instance_Applier {

	const WIDGET_TAG = 'e-widget';
	const WIDGET_ID_KEY = 'widget_id';
	const PART_SEPARATOR = '.';

	const INVALID_INSTANCE_CODE = 'elementor_invalid_widget_instance';
	const NOT_FOUND_CODE = 'elementor_widget_not_found';
	const ARCHIVED_CODE = 'elementor_widget_archived';
	const DUPLICATE_CONFIGURATION_ID_CODE = 'elementor_duplicate_configuration_id';

	const PART_NOT_FOUND_WARNING = 'widget_part_not_found';
	const KEY_IGNORED_WARNING = 'widget_config_key_ignored';

	private Widgets_Definitions_Registry $registry;
	private Widget_Instance_Factory $factory;

	public function __construct( Widgets_Definitions_Registry $registry, ?Widget_Instance_Factory $factory = null ) {
		$this->registry = $registry;
		$this->factory = $factory ?? new Widget_Instance_Factory();
	}

	public static function get_part_configuration_id( string $configuration_id, string $part ): string {
		return $configuration_id . self::PART_SEPARATOR . $part;
	}

	/**
	 * @param array<string, array&> $config_id_index       Index of subtree refs; expanded parts are added to it.
	 * @param array<string, mixed>  $element_config        Per-config-id settings.
	 * @param string[]              $referenced_config_ids Every configuration-id used as a key in the input maps.
	 *
	 * @return array{error: ?\WP_Error, warnings: Warnings_Bag, element_config: array, element_types: string[]}
	 */
	public function apply( array &$config_id_index, array $element_config, array $referenced_config_ids ): array {
		$errors = [];
		$warnings = Warnings_Bag::make();
		$element_types = [];
		$widget_config_ids = [];

		foreach ( array_keys( $config_id_index ) as $config_id ) {
			$config_id = (string) $config_id;

			if ( self::WIDGET_TAG !== ( $config_id_index[ $config_id ]['widgetType'] ?? null ) ) {
				continue;
			}

			$entry = is_array( $element_config[ $config_id ] ?? null ) ? $element_config[ $config_id ] : [];
			$definition = $this->resolve_definition( $config_id, $entry[ self::WIDGET_ID_KEY ] ?? null );

			if ( is_wp_error( $definition ) ) {
				if ( Site_Widgets_Pro_Features_Discovery::is_error( $definition ) ) {
					return $this->result( $definition, $warnings, $element_config, $element_types );
				}

				$errors[] = $definition;
				continue;
			}

			unset( $element_config[ $config_id ] );
			$this->warn_ignored_keys( $config_id, $entry, $warnings );

			$instance = $this->factory->create( $definition );
			Editor_Settings::apply_name( $instance, $config_id );

			$config_id_index[ $config_id ] = $instance;
			$this->index_parts( $config_id_index[ $config_id ], $config_id, $config_id_index, $errors, $element_types );

			$widget_config_ids[] = $config_id;
		}

		if ( ! empty( $errors ) ) {
			return $this->result( $this->combine_errors( $errors ), $warnings, $element_config, $element_types );
		}

		$this->warn_unknown_parts( $referenced_config_ids, $widget_config_ids, $config_id_index, $warnings );

		return $this->result( null, $warnings, $element_config, array_values( array_unique( $element_types ) ) );
	}

	/**
	 * @param string $config_id
	 * @param mixed  $widget_id
	 *
	 * @return array|\WP_Error
	 */
	private function resolve_definition( string $config_id, $widget_id ) {
		if ( ! is_string( $widget_id ) || '' === $widget_id ) {
			return new \WP_Error(
				self::INVALID_INSTANCE_CODE,
				sprintf(
					/* translators: 1: configuration-id, 2: element_config key */
					__( '[%1$s] <e-widget> needs "%2$s" in element_config. Get widget ids from elementor/list-widget-schemas.', 'elementor' ),
					$config_id,
					self::WIDGET_ID_KEY
				),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		if ( Widget_Definition::is_site_namespace( $widget_id ) && ! Site_Widgets_Access_Controller::can_add_to_page() ) {
			return Site_Widgets_Pro_Features_Discovery::for_add_to_page();
		}

		$definition = $this->registry->get( $widget_id );

		if ( ! $definition ) {
			return new \WP_Error(
				self::NOT_FOUND_CODE,
				sprintf(
					/* translators: 1: configuration-id, 2: widget id */
					__( '[%1$s] Unknown widget "%2$s". Get widget ids from elementor/list-widget-schemas.', 'elementor' ),
					$config_id,
					$widget_id
				),
				[ 'status' => \WP_Http::NOT_FOUND ]
			);
		}

		if ( ! empty( $definition[ Widgets_Definitions_Registry::ARCHIVED_KEY ] ) ) {
			return new \WP_Error(
				self::ARCHIVED_CODE,
				sprintf(
					/* translators: 1: configuration-id, 2: widget id */
					__( '[%1$s] Widget "%2$s" is archived, so it can\'t be added to pages.', 'elementor' ),
					$config_id,
					$widget_id
				),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		return $definition;
	}

	/**
	 * Slot content isn't part of the widget, so the walk stops at a slot.
	 */
	private function index_parts( array &$element, string $config_id, array &$config_id_index, array &$errors, array &$element_types ): void {
		$element_types[] = $element['widgetType'] ?? $element['elType'];
		$part = $element[ Widget_Markers::PART_KEY ] ?? null;

		if ( is_string( $part ) && '' !== $part ) {
			$part_config_id = self::get_part_configuration_id( $config_id, $part );

			if ( isset( $config_id_index[ $part_config_id ] ) ) {
				$errors[] = $this->duplicate_configuration_id_error( $part_config_id );
			} else {
				$config_id_index[ $part_config_id ] = &$element;
			}
		}

		if ( ! empty( $element[ Widget_Markers::SLOT_KEY ] ) || empty( $element['elements'] ) ) {
			return;
		}

		foreach ( array_keys( $element['elements'] ) as $index ) {
			$this->index_parts( $element['elements'][ $index ], $config_id, $config_id_index, $errors, $element_types );
		}
	}

	private function warn_ignored_keys( string $config_id, array $entry, Warnings_Bag $warnings ): void {
		foreach ( array_keys( $entry ) as $key ) {
			if ( self::WIDGET_ID_KEY === $key ) {
				continue;
			}

			$warnings->add(
				self::KEY_IGNORED_WARNING,
				sprintf(
					/* translators: 1: ignored key, 2: example part configuration-id */
					__( '"%1$s" was ignored: an <e-widget> entry takes only widget_id. Configure each part under its own key, e.g. "%2$s".', 'elementor' ),
					$key,
					self::get_part_configuration_id( $config_id, 'part_name' )
				),
				$config_id
			);
		}
	}

	private function warn_unknown_parts( array $referenced_config_ids, array $widget_config_ids, array $config_id_index, Warnings_Bag $warnings ): void {
		foreach ( array_unique( array_map( 'strval', $referenced_config_ids ) ) as $referenced_id ) {
			if ( isset( $config_id_index[ $referenced_id ] ) ) {
				continue;
			}

			foreach ( $widget_config_ids as $widget_config_id ) {
				if ( ! str_starts_with( $referenced_id, $widget_config_id . self::PART_SEPARATOR ) ) {
					continue;
				}

				$warnings->add(
					self::PART_NOT_FOUND_WARNING,
					sprintf(
						/* translators: 1: configuration-id, 2: widget configuration-id */
						__( '"%1$s" matches no part of widget "%2$s" and was ignored. Read the widget\'s parts from elementor/get-widget-schemas.', 'elementor' ),
						$referenced_id,
						$widget_config_id
					),
					$referenced_id
				);
				break;
			}
		}
	}

	private function duplicate_configuration_id_error( string $part_config_id ): \WP_Error {
		return new \WP_Error(
			self::DUPLICATE_CONFIGURATION_ID_CODE,
			sprintf(
				/* translators: %s: configuration-id */
				__( 'Duplicate configuration-id "%s": it is also a widget part key. Rename the element.', 'elementor' ),
				$part_config_id
			),
			[ 'status' => \WP_Http::BAD_REQUEST ]
		);
	}

	/**
	 * @param \WP_Error[] $errors
	 */
	private function combine_errors( array $errors ): \WP_Error {
		$combined = new \WP_Error(
			$errors[0]->get_error_code(),
			implode( ' ', array_map( fn ( \WP_Error $error ) => $error->get_error_message(), $errors ) ),
			$errors[0]->get_error_data()
		);

		foreach ( array_slice( $errors, 1 ) as $error ) {
			$combined->add( $error->get_error_code(), $error->get_error_message(), $error->get_error_data() );
		}

		return $combined;
	}

	private function result( ?\WP_Error $error, Warnings_Bag $warnings, array $element_config, array $element_types ): array {
		return [
			'error' => $error,
			'warnings' => $warnings,
			'element_config' => $element_config,
			'element_types' => $element_types,
		];
	}
}
