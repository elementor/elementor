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

		$this->revert_theme( $data );
	}

	protected function revert_theme( $data ) {
		$installed_theme = $data['runners'][ static::get_name() ]['installed_theme'];
		$previous_active_theme = $data['runners'][ static::get_name() ]['previous_active_theme'];

		if ( empty( $installed_theme ) || ! $this->should_delete_theme( $installed_theme ) ) {
			return null;
		}

		if ( $this->delete_theme( $installed_theme ) ) {
			$this->activate_previous_theme( $previous_active_theme );
		}
	}

	protected function should_delete_theme( $theme_slug ): bool {
		$current_theme = wp_get_theme();

		return $theme_slug !== $current_theme->get_stylesheet() && wp_get_theme( $theme_slug )->exists();
	}

	protected function delete_theme( $theme_slug ): bool {
		return delete_theme( $theme_slug );
	}

	protected function activate_previous_theme( $previous_active_theme ) {
		if ( ! $previous_active_theme ) {
			return;
		}

		$theme = wp_get_theme( $previous_active_theme );

		if ( ! $theme->exists() ) {
			return;
		}

		switch_theme( $theme->get_stylesheet() );
	}
}
