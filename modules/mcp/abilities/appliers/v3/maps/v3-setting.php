<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings\Enum_From_Control_Setting_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings\Gallery_Setting_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings\Icons_Setting_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings\Link_Setting_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings\Multi_Enum_From_Control_Setting_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings\Number_Setting_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings\Repeater_Setting_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings\Size_Setting_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings\String_Setting_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings\Switcher_Setting_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings\V3_Setting_Adapter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class V3_Setting {

	private string $control_key;

	private V3_Setting_Adapter $adapter;

	private bool $dynamic = false;

	private ?string $default_value = null;

	private function __construct( string $control_key ) {
		$this->control_key = $control_key;
		$this->adapter = new String_Setting_Adapter();
	}

	public static function bind_to( string $control_key ): self {
		return new self( $control_key );
	}

	public function string(): self {
		$this->adapter = new String_Setting_Adapter();

		return $this;
	}

	/**
	 * @param string[] $values
	 */
	public function enum( array $values ): self {
		$this->adapter = new String_Setting_Adapter( $values );

		return $this;
	}

	public function enum_from_control(): self {
		$this->adapter = new Enum_From_Control_Setting_Adapter();

		return $this;
	}

	public function multi_enum_from_control(): self {
		$this->adapter = new Multi_Enum_From_Control_Setting_Adapter();

		return $this;
	}

	public function switcher(): self {
		$this->adapter = new Switcher_Setting_Adapter();

		return $this;
	}

	public function number(): self {
		$this->adapter = new Number_Setting_Adapter();

		return $this;
	}

	public function size(): self {
		$this->adapter = new Size_Setting_Adapter();

		return $this;
	}

	public function link(): self {
		$this->adapter = new Link_Setting_Adapter();

		return $this;
	}

	public function gallery(): self {
		$this->adapter = new Gallery_Setting_Adapter();

		return $this;
	}

	/**
	 * @param array<string, V3_Setting> $fields Row fields keyed by public name, each bound to a repeater field control.
	 */
	public function repeater( array $fields ): self {
		$this->adapter = new Repeater_Setting_Adapter( $fields );

		return $this;
	}

	public function icons(): self {
		$this->adapter = new Icons_Setting_Adapter();

		return $this;
	}

	public function dynamic(): self {
		$this->dynamic = true;

		return $this;
	}

	public function default( string $value ): self {
		$this->default_value = $value;

		return $this;
	}

	public function get_control_key(): string {
		return $this->control_key;
	}

	public function get_adapter(): V3_Setting_Adapter {
		return $this->adapter;
	}

	public function is_dynamic(): bool {
		return $this->dynamic;
	}

	public function get_default(): ?string {
		return $this->default_value;
	}
}
