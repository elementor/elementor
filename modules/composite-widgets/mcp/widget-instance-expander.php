<?php

namespace Elementor\Modules\CompositeWidgets\Mcp;

use Elementor\Modules\CompositeWidgets\Definitions\Widget_Definition;
use Elementor\Modules\CompositeWidgets\Definitions\Widgets_Definitions_Registry;
use Elementor\Modules\CompositeWidgets\Instance\Template_Parts;
use Elementor\Modules\CompositeWidgets\Instance\Widget_Instance_Factory;
use Elementor\Modules\CompositeWidgets\Site\Site_Widgets_Access_Controller;
use Elementor\Modules\Mcp\Abilities\Build_Composition\Composition_Tag_Expander;
use Elementor\Modules\Mcp\Abilities\Utils\Editor_Settings;
use Elementor\Modules\Mcp\Abilities\Utils\Warnings_Bag;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * `<e-widget configuration-id="x"/>` + `element_config.x = { widget_id }` inserts a composite widget instance.
 * Its parts are indexed as `x.<part>`, so the composition's appliers configure each part with its own schema.
 */
class Widget_Instance_Expander implements Composition_Tag_Expander {
	const TAG = 'e-widget';
	const WIDGET_ID_KEY = 'widget_id';
	const PART_SEPARATOR = '.';
	const ERROR_CODE = 'elementor_invalid_widget_instance';
	const PART_NOT_FOUND_WARNING = 'widget_part_not_found';
	const KEY_IGNORED_WARNING = 'widget_config_key_ignored';

	/** @var callable(): Widgets_Definitions_Registry */
	private $get_registry;

	private Widget_Instance_Factory $factory;

	/**
	 * @param callable(): Widgets_Definitions_Registry $get_registry Called only when a composition has a widget tag.
	 * @param Widget_Instance_Factory|null             $factory
	 */
	public function __construct( callable $get_registry, ?Widget_Instance_Factory $factory = null ) {
		$this->get_registry = $get_registry;
		$this->factory = $factory ?? new Widget_Instance_Factory();
	}

	public static function get_part_configuration_id( string $configuration_id, string $part ): string {
		return $configuration_id . self::PART_SEPARATOR . $part;
	}

	public function get_tag(): string {
		return self::TAG;
	}

	public function get_unavailable_error( array $config ): ?\WP_Error {
		$widget_id = $config[ self::WIDGET_ID_KEY ] ?? null;

		if ( ! is_string( $widget_id ) || ! Widget_Definition::is_site_namespace( $widget_id ) || Site_Widgets_Access_Controller::can_add_to_page() ) {
			return null;
		}

		return Site_Widgets_Pro_Features_Discovery::for_add_to_page();
	}

	public function expand( array &$config_id_index, array $placeholders, array $referenced_config_ids ): array {
		$errors = [];
		$warnings = Warnings_Bag::make();
		$registry = ( $this->get_registry )();

		foreach ( $placeholders as $config_id => $config ) {
			$config_id = (string) $config_id;
			$definition = $this->find_definition( $registry, $config_id, $config, $errors );

			if ( ! $definition ) {
				continue;
			}

			$this->warn_ignored_keys( $config_id, $config, $warnings );

			$instance = $this->factory->create( $definition );
			Editor_Settings::apply_name( $instance, $config_id );

			$config_id_index[ $config_id ] = $instance;
			$this->index_parts( $config_id_index, $config_id, $errors );
		}

		if ( ! empty( $errors ) ) {
			return [
				'error' => new \WP_Error( self::ERROR_CODE, implode( ' ', $errors ), [ 'status' => \WP_Http::BAD_REQUEST ] ),
				'warnings' => $warnings,
			];
		}

		$this->warn_unknown_parts( $referenced_config_ids, array_map( 'strval', array_keys( $placeholders ) ), $config_id_index, $warnings );

		return [
			'error' => null,
			'warnings' => $warnings,
		];
	}

	private function find_definition( Widgets_Definitions_Registry $registry, string $config_id, array $config, array &$errors ): ?array {
		$widget_id = $config[ self::WIDGET_ID_KEY ] ?? null;

		if ( ! is_string( $widget_id ) || '' === $widget_id ) {
			/* translators: 1: configuration-id, 2: element_config key */
			$errors[] = sprintf( __( '[%1$s] <e-widget> needs "%2$s" in element_config. Get widget ids from the elementor://composite-widgets resource.', 'elementor' ), $config_id, self::WIDGET_ID_KEY );
			return null;
		}

		$definition = $registry->get( $widget_id );

		if ( ! $definition ) {
			/* translators: 1: configuration-id, 2: widget id */
			$errors[] = sprintf( __( '[%1$s] Unknown widget "%2$s". Get widget ids from the elementor://composite-widgets resource.', 'elementor' ), $config_id, $widget_id );
			return null;
		}

		if ( ! empty( $definition[ Widgets_Definitions_Registry::ARCHIVED_KEY ] ) ) {
			/* translators: 1: configuration-id, 2: widget id */
			$errors[] = sprintf( __( '[%1$s] Widget "%2$s" is archived, so it can\'t be added to pages.', 'elementor' ), $config_id, $widget_id );
			return null;
		}

		return $definition;
	}

	private function index_parts( array &$config_id_index, string $config_id, array &$errors ): void {
		Template_Parts::walk( $config_id_index[ $config_id ], function ( array &$element, string $part ) use ( &$config_id_index, $config_id, &$errors ) {
			$part_config_id = self::get_part_configuration_id( $config_id, $part );

			if ( isset( $config_id_index[ $part_config_id ] ) ) {
				/* translators: %s: configuration-id */
				$errors[] = sprintf( __( '[%s] This configuration-id is also a widget part key. Rename the element.', 'elementor' ), $part_config_id );
				return;
			}

			$config_id_index[ $part_config_id ] = &$element;
		} );
	}

	private function warn_ignored_keys( string $config_id, array $config, Warnings_Bag $warnings ): void {
		foreach ( array_keys( $config ) as $key ) {
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
		foreach ( array_unique( $referenced_config_ids ) as $referenced_id ) {
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
						__( '"%1$s" matches no part of widget "%2$s" and was ignored. Read the widget\'s parts from the elementor://composite-widgets resource.', 'elementor' ),
						$referenced_id,
						$widget_config_id
					),
					$referenced_id
				);
				break;
			}
		}
	}
}
