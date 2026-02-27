<?php

namespace Elementor\Modules\DesignSystemSync\Classes;

use Elementor\Modules\Variables\Services\Batch_Operations\Batch_Processor;
use Elementor\Modules\Variables\Services\Variables_Service;
use Elementor\Modules\Variables\Storage\Variables_Repository;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Variables_Provider {
	private static $cached_variables = null;

	public static function get_all_variables(): array {
		if ( null !== self::$cached_variables ) {
			return self::$cached_variables;
		}

		$kit = Plugin::$instance->kits_manager->get_active_kit();

		if ( ! $kit ) {
			return [];
		}

		$repository = new Variables_Repository( $kit );
		$service = new Variables_Service( $repository, new Batch_Processor() );
		self::$cached_variables = $service->get_variables_list();

		return self::$cached_variables;
	}

	public static function get_synced_color_variables(): array {
		$all_variables = self::get_all_variables();
		$color_variables = [];

		foreach ( $all_variables as $id => $variable ) {
			if ( isset( $variable['deleted'] ) && $variable['deleted'] ) {
				continue;
			}

			if ( empty( $variable['type'] ) || 'global-color-variable' !== $variable['type'] ) {
				continue;
			}

			if ( empty( $variable['sync_to_v3'] ) ) {
				continue;
			}

			$color_variables[ $id ] = $variable;
		}
		return $color_variables;
	}

	public static function clear_cache() {
		self::$cached_variables = null;
	}

	public static function get_v4_variable_id( string $label ): string {
		return 'v4-' . strtolower( $label );
	}
}
