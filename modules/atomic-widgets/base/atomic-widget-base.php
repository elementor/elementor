<?php
namespace Elementor\Modules\AtomicWidgets\Base;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Widget_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Atomic_Widget_Base extends Widget_Base {
	protected $version = '0.0';
	protected $styles = [];

	public function __construct( $data = [], $args = null ) {
		parent::__construct( $data, $args );

		$this->version = $data['version'] ?? '0.0';
		$this->styles = $data['styles'] ?? [];
	}

	public function get_atomic_controls() {
		$controls = $this->define_atomic_controls();

		return $this->get_valid_controls( $controls );
	}

	private function get_valid_controls( array $controls ): array {
		$valid_controls = [];
		$schema = static::get_props_schema();

		foreach ( $controls as $control ) {
			if ( $control instanceof Section ) {
				$cloned_section = clone $control;

				$cloned_section->set_items(
					$this->get_valid_controls( $control->get_items() )
				);

				$valid_controls[] = $cloned_section;
				continue;
			}

			if ( ! ( $control instanceof Atomic_Control_Base ) ) {
				$this->safe_throw( 'Control must be an instance of `Atomic_Control_Base`.' );
				continue;
			}

			$prop_name = $control->get_bind();

			if ( ! $prop_name ) {
				$this->safe_throw( 'Control is missing a bound prop from the schema.' );
				continue;
			}

			if ( ! array_key_exists( $prop_name, $schema ) ) {
				$this->safe_throw( "Prop `{$prop_name}` is not defined in the schema of `{$this->get_name()}`. Did you forget to define it?" );
				continue;
			}

			$valid_controls[] = $control;
		}

		return $valid_controls;
	}

	private function safe_throw( string $message ) {
		if ( ! defined( 'ELEMENTOR_DEBUG' ) || ! ELEMENTOR_DEBUG ) {
			return;
		}

		throw new \Exception( $message );
	}

	abstract protected function define_atomic_controls(): array;

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

	final public function get_raw_data( $with_html_content = false ) {
		$raw_data = parent::get_raw_data( $with_html_content );

		$raw_data['styles'] = $this->styles;

		return $raw_data;
	}

	final public function get_stack( $with_common_controls = true ) {
		return [
			'controls' => [],
			'tabs' => [],
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

			$transformed_settings[ $key ] = $this->transform_setting( $transformed_settings[ $key ] );
		}

		return $transformed_settings;
	}

	public static function get_props_schema() {
		return static::define_props_schema();
	}

	private function transform_setting( $setting ) {
		if ( ! $this->is_transformable( $setting ) ) {
			return $setting;
		}

		switch ( $setting['$$type'] ) {
			case 'classes':
				return is_array( $setting['value'] )
					? join( ' ', $setting['value'] )
					: '';

			default:
				return null;
		}
	}

	private function is_transformable( $setting ): bool {
		return ! empty( $setting['$$type'] ) && 'string' === getType( $setting['$$type'] ) && isset( $setting['value'] );
	}

	abstract protected static function define_props_schema(): array;
}
