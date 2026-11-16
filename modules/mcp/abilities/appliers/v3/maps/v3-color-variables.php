<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\DesignSystemSync\Module as Design_System_Sync_Module;
use Elementor\Modules\Variables\PropTypes\Color_Variable_Prop_Type;
use Elementor\Modules\Variables\Services\Batch_Operations\Batch_Processor;
use Elementor\Modules\Variables\Services\Variables_Service;
use Elementor\Modules\Variables\Storage\Variables_Repository;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * V3 colors can only link to a V4 color variable that is synced to the V3 global colors,
 * through the `v4-<label>` global color the design system sync registers for it.
 */
class V3_Color_Variables {

	const GLOBAL_COLORS_PREFIX = 'globals/colors?id=';

	/**
	 * @var callable(): (Variables_Service|null)
	 */
	private $create_service;

	private ?Variables_Service $service = null;

	private bool $is_service_created = false;

	/**
	 * @param callable(): (Variables_Service|null) $create_service
	 */
	public function __construct( callable $create_service ) {
		$this->create_service = $create_service;
	}

	public static function create_default(): self {
		return new self( static function (): ?Variables_Service {
			$kit = Plugin::$instance->kits_manager->get_active_kit();

			return $kit ? new Variables_Service( new Variables_Repository( $kit ), new Batch_Processor() ) : null;
		} );
	}

	/**
	 * @return string|null The variable id of the first color variable in a color, background or box shadow prop value.
	 */
	public static function variable_id_in( array $prop_value ): ?string {
		foreach ( self::color_paths( $prop_value ) as $path ) {
			$color = self::at( $prop_value, $path );

			if ( Color_Variable_Prop_Type::get_key() === ( $color['$$type'] ?? null ) && is_string( $color['value'] ?? null ) ) {
				return $color['value'];
			}
		}

		return null;
	}

	public static function with_resolved_color( array $prop_value, string $color ): array {
		foreach ( self::color_paths( $prop_value ) as $path ) {
			if ( Color_Variable_Prop_Type::get_key() === ( self::at( $prop_value, $path )['$$type'] ?? null ) ) {
				$prop_value = self::replaced_at( $prop_value, $path, Color_Prop_Type::generate( $color ) );
			}
		}

		return $prop_value;
	}

	/**
	 * @return array{id: string, label: string, value: string, sync_to_v3?: bool}|null
	 */
	public function find( string $variable_id ): ?array {
		$variable = $this->service() ? $this->service()->find_by_label_or_id( $variable_id ) : null;

		if ( null === $variable || Color_Variable_Prop_Type::get_key() !== ( $variable['type'] ?? null ) || ! is_string( $variable['value'] ?? null ) ) {
			return null;
		}

		return $variable;
	}

	public function global_link( array $variable ): ?string {
		if ( empty( $variable['sync_to_v3'] ) || empty( $variable['label'] ) ) {
			return null;
		}

		return self::GLOBAL_COLORS_PREFIX . Design_System_Sync_Module::get_v3_sync_id( $variable['label'] );
	}

	/**
	 * @param mixed $global_link
	 */
	public function variable_id_for_global_link( $global_link ): ?string {
		if ( ! is_string( $global_link ) || 0 !== strpos( $global_link, self::GLOBAL_COLORS_PREFIX ) || ! $this->service() ) {
			return null;
		}

		foreach ( $this->service()->get_variables_list() as $id => $variable ) {
			if ( empty( $variable['deleted'] ) && $global_link === $this->global_link( $variable ) ) {
				return (string) $id;
			}
		}

		return null;
	}

	private function service(): ?Variables_Service {
		if ( ! $this->is_service_created ) {
			$this->service = ( $this->create_service )();
			$this->is_service_created = true;
		}

		return $this->service;
	}

	/**
	 * @return array<int, string[]>
	 */
	private static function color_paths( array $prop_value ): array {
		$paths = [ [], [ 'value', 'color' ] ];

		foreach ( array_keys( is_array( $prop_value['value'] ?? null ) ? $prop_value['value'] : [] ) as $index ) {
			if ( is_int( $index ) ) {
				$paths[] = [ 'value', $index, 'value', 'color' ];
			}
		}

		return $paths;
	}

	private static function at( array $prop_value, array $path ): ?array {
		foreach ( $path as $key ) {
			if ( ! is_array( $prop_value ) || ! array_key_exists( $key, $prop_value ) ) {
				return null;
			}

			$prop_value = $prop_value[ $key ];
		}

		return is_array( $prop_value ) ? $prop_value : null;
	}

	private static function replaced_at( array $prop_value, array $path, array $replacement ): array {
		if ( empty( $path ) ) {
			return $replacement;
		}

		$key = array_shift( $path );
		$prop_value[ $key ] = self::replaced_at( $prop_value[ $key ], $path, $replacement );

		return $prop_value;
	}
}
