<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings\V3_Setting_Adapter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Compiled_V3_Setting {

	private string $control_key;

	private bool $dynamic;

	private V3_Setting_Adapter $adapter;

	private Prop_Type $prop_type;

	/**
	 * @var array<string, mixed>
	 */
	private array $control;

	/**
	 * @var array<string, mixed>
	 */
	private array $schema;

	/**
	 * @param string               $control_key
	 * @param bool                 $dynamic
	 * @param V3_Setting_Adapter   $adapter
	 * @param Prop_Type            $prop_type
	 * @param array<string, mixed> $control
	 * @param array<string, mixed> $schema      Plain JSON schema advertised for the setting.
	 */
	public function __construct( string $control_key, bool $dynamic, V3_Setting_Adapter $adapter, Prop_Type $prop_type, array $control, array $schema ) {
		$this->control_key = $control_key;
		$this->dynamic = $dynamic;
		$this->adapter = $adapter;
		$this->prop_type = $prop_type;
		$this->control = $control;
		$this->schema = $schema;
	}

	public function get_control_key(): string {
		return $this->control_key;
	}

	public function is_dynamic(): bool {
		return $this->dynamic;
	}

	public function get_prop_type(): Prop_Type {
		return $this->prop_type;
	}

	/**
	 * @return mixed
	 */
	public function to_control_value( array $prop_value ) {
		return $this->adapter->to_control_value( $prop_value, $this->control );
	}

	/**
	 * @param mixed $stored
	 * @return mixed
	 */
	public function from_control_value( $stored ) {
		return $this->adapter->from_control_value( $stored, $this->control );
	}

	/**
	 * @return array<string, mixed>
	 */
	public function get_schema(): array {
		return $this->schema;
	}
}
