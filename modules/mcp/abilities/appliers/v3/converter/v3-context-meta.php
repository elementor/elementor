<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Compiled_V3_Map;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Immutable per-node conversion metadata: the widget's compiled map and the controls
 * it was compiled against.
 */
class V3_Context_Meta {

	private Compiled_V3_Map $map;
	private array $controls;

	public function __construct( Compiled_V3_Map $map, array $controls ) {
		$this->map = $map;
		$this->controls = $controls;
	}

	public function map(): Compiled_V3_Map {
		return $this->map;
	}

	public function controls(): array {
		return $this->controls;
	}
}
