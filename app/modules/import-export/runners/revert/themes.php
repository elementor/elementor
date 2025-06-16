<?php

namespace Elementor\App\Modules\ImportExport\Runners\Revert;

class Themes extends Revert_Runner_Base {
	public static function get_name(): string {
		return 'themes';
	}

	public function should_revert( array $data ): bool {
		return (
			isset( $data['runners'] ) &&
			array_key_exists( static::get_name(), $data['runners'] )
		);
	}

	public function revert( array $data ) {
		if ( empty( $data['runners'][ static::get_name() ]['installed_themes'] ) ) {
			return;
		}


		foreach ( $data['runners'][ static::get_name() ]['installed_themes'] as $installed_theme ) {
			if ( ! $this->should_delete_theme( $installed_theme ) ) {
				continue;
			}

			delete_theme( $installed_theme );
		}
	}

	public function should_delete_theme( $theme_slug ): bool {
		$current_theme = wp_get_theme();

		return $theme_slug !== $current_theme->get_stylesheet() && wp_get_theme( $theme_slug )->exists();
	}
}
