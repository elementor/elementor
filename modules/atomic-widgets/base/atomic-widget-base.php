<?php
namespace Elementor\Modules\AtomicWidgets\Base;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Schema\Atomic_Prop;
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
		$controls = $this->get_atomic_controls_definition();

		$this->validate_controls( $controls );

		return $controls;
	}

	private function validate_controls( array $controls ): void {
		if ( ! defined( 'ELEMENTOR_DEBUG' ) || ! ELEMENTOR_DEBUG ) {
			return;
		}

		$schema = static::get_props_schema();

		foreach ( $controls as $control ) {
			if ( $control instanceof Section ) {
				$this->validate_controls( $control->get_items() );
				continue;
			}

			$prop_name = $control instanceof Atomic_Control_Base
				? $control->get_bind()
				: $control['value']['bind'] ?? null; // TODO: Do we want to support plain objects?

			if ( ! $prop_name ) {
				throw new \Exception( 'Control is missing a bound prop from the schema.' );
			}

			if ( ! array_key_exists( $prop_name, $schema ) ) {
				throw new \Exception( "Prop `{$prop_name}` is not defined in the schema of `{$this->get_name()}`. Did you forget to define it?" );
			}
		}
	}

	abstract protected function get_atomic_controls_definition(): array;

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
		}

		// TODO: Run through the transformers.
		return $transformed_settings;
	}

	abstract public static function get_props_schema(): array;
}
