<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Node_Settings_Host implements V3_Map_Settings_Host {

	public function read( array $node ): array {
		return is_array( $node['settings'] ?? null ) ? $node['settings'] : [];
	}

	public function write( array &$node, array $settings ): void {
		$node['settings'] = $settings;
	}
}
