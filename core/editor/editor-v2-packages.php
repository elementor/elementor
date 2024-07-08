<?php
namespace Elementor\Core\Editor;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Core\Utils\Collection;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Editor_V2_Packages {
	public static function collect() {
		$packages_to_enqueue = apply_filters( 'elementor/editor/v2/packages', [] );

		return Collection::make( $packages_to_enqueue )
			->unique();
	}
}
