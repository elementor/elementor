<?php
namespace Elementor\Modules\AtomicWidgets\Base;

use Elementor\Modules\AtomicWidgets\Schema\Atomic_Prop;
use Elementor\Widget_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Atomic_Widget_Base extends Widget_Base {
	protected $version = '0.0';

	/**
	 * @var array<string, array<string, Atomic_Prop>>
	 */
	protected static array $props_schema_cache = [];

	public function __construct( $data = [], $args = null ) {
		parent::__construct( $data, $args );

		$this->version = $data['version'] ?? '0.0';
	}

	abstract public function get_atomic_controls(): array;

	final public function get_controls( $control_id = null ) {
		if ( ! empty( $control_id ) ) {
			return null;
		}

		return [];
	}

	final public function get_initial_config() {
		$config = parent::get_initial_config();

		$config['atomic_controls'] = $this->get_atomic_controls();
		$config['version'] = $this->version;

		return $config;
	}

	final public function get_data_for_save() {
		$data = parent::get_data_for_save();

		$data['version'] = $this->version;

		return $data;
	}

	final public function get_stack( $with_common_controls = true ) {
		return [
			'controls' => [],
			'tabs' => [ 'content' => 'content' ],
		];
	}

	final public function get_atomic_settings(): array {
		$schema = static::get_props_schema();
		$raw_settings = $this->get_settings();

		$transformed_settings = [];

		foreach ( $schema as $key => $prop ) {
			if ( array_key_exists( $key, $raw_settings ) ) {
				$transformed_settings[ $key ] = $raw_settings[ $key ];
			} else {
				$transformed_settings[ $key ] = $prop->get_default();
			}
		}

		// TODO: Run through the transformers.
		return $transformed_settings;
	}

	public static function get_props_schema(): array {
		$cache_key = static::class;

		if ( empty( static::$props_schema_cache[ $cache_key ] ) ) {
			static::$props_schema_cache[ $cache_key ] = static::get_props_schema_definition();
		}

		return static::$props_schema_cache[ $cache_key ];
	}

	/**
	 * @return array<string, Atomic_Prop>
	 */
	abstract protected static function get_props_schema_definition(): array;
}
