<?php

namespace Elementor\Modules\Components\Variants;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Component_Variant {
	/** @var string */
	public $id;

	/** @var string */
	public $label;

	/**
	 * Widget entries keyed by element id. Each entry may include:
	 * - `settings.classes.add`: string[] of class ids to add on top of the base
	 * - `variant`: string id of a nested component variant to apply
	 *
	 * @var array<string, array>
	 */
	public $widgets;

	public function __construct( string $id, string $label, array $widgets ) {
		$this->id = $id;
		$this->label = $label;
		$this->widgets = $widgets;
	}

	public static function make( array $variant ): self {
		return new self(
			$variant['id'],
			$variant['label'],
			$variant['widgets'] ?? []
		);
	}

	public function to_associative_array(): array {
		return [
			'id' => $this->id,
			'label' => $this->label,
			'widgets' => $this->widgets,
		];
	}
}
