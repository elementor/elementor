<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class V3_Widget_Map {

	private string $widget_type;

	private string $description = '';

	/**
	 * @var array<string, V3_Setting>
	 */
	private array $settings = [];

	private ?Style_Target $default_target = null;

	/**
	 * @var Style_Target[]
	 */
	private array $targets = [];

	private ?string $kit_tab = null;

	/**
	 * @var string[]
	 */
	private array $required_kit_controls = [];

	private function __construct( string $widget_type ) {
		$this->widget_type = $widget_type;
	}

	public static function make( string $widget_type ): self {
		return new self( $widget_type );
	}

	public function description( string $description ): self {
		$this->description = $description;

		return $this;
	}

	/**
	 * @param array<string, V3_Setting> $settings Keyed by the public property name exposed to the LLM.
	 */
	public function settings( array $settings ): self {
		$this->settings = $settings;

		return $this;
	}

	public function default_target( Style_Target $target ): self {
		$this->default_target = $target;

		return $this;
	}

	public function targets( Style_Target ...$targets ): self {
		$this->targets = array_merge( $this->targets, $targets );

		return $this;
	}

	/**
	 * The style targets read and write the controls of this Site Settings tab on the active kit,
	 * so a write styles every page of the site.
	 *
	 * @param string   $tab_id            Kit tab ID, e.g. `settings-woocommerce`.
	 * @param string[] $required_controls Controls the tab must register for the map to apply, e.g. ones a license adds.
	 */
	public function kit_tab( string $tab_id, array $required_controls = [] ): self {
		$this->kit_tab = $tab_id;
		$this->required_kit_controls = $required_controls;

		return $this;
	}

	public function get_widget_type(): string {
		return $this->widget_type;
	}

	public function get_description(): string {
		return $this->description;
	}

	/**
	 * @return array<string, V3_Setting>
	 */
	public function get_settings(): array {
		return $this->settings;
	}

	public function get_kit_tab(): ?string {
		return $this->kit_tab;
	}

	/**
	 * @return string[]
	 */
	public function get_required_kit_controls(): array {
		return $this->required_kit_controls;
	}

	public function get_default_target(): ?Style_Target {
		return $this->default_target;
	}

	/**
	 * @return Style_Target[] The default target first, then the others in declaration order.
	 */
	public function get_all_targets(): array {
		return null === $this->default_target
			? $this->targets
			: array_merge( [ $this->default_target ], $this->targets );
	}
}
