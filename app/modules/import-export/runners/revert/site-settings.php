<?php

namespace Elementor\App\Modules\ImportExport\Runners\Revert;

use Elementor\Plugin;

class Site_Settings extends Revert_Runner_Base {

	public static function get_name(): string {
		return 'site-settings';
	}

	public function should_revert( array $data ): bool {
		return (
			isset( $data['runners'] ) &&
			array_key_exists( static::get_name(), $data['runners'] )
		);
	}

	public function revert( array $data ) {
		Plugin::$instance->kits_manager->revert(
			$data['runners'][ static::get_name() ]['imported_kit_id'],
			$data['runners'][ static::get_name() ]['active_kit_id'],
			$data['runners'][ static::get_name() ]['previous_kit_id']
		);

		$installed_theme = $data['runners'][ static::get_name() ]['installed_theme'];

		if ( ! empty( $installed_theme ) ) {
			if ( $this->should_delete_theme( $installed_theme ) ) {
				delete_theme( $installed_theme );
			}
		}
	}

	private function should_delete_theme( $theme_slug ): bool {
		$current_theme = wp_get_theme();

		return $theme_slug !== $current_theme->get_stylesheet() && wp_get_theme( $theme_slug )->exists();
	}
}
