<?php

namespace Elementor\App\Modules\ImportExport\Runners\Export;

use Elementor\Core\Base\Document;
use Elementor\Plugin;
use Elementor\TemplateLibrary\Source_Local;
use Elementor\Utils;

class Themes extends Export_Runner_Base {

	public static function get_name(): string {
		return 'themes';
	}

	public function should_export( array $data ) {
		return (
			Utils::has_pro() &&
			isset( $data['include'] ) &&
			in_array( 'themes', $data['include'], true )
		);
	}

	public function export( array $data ) {
		$theme = wp_get_theme();

		if ( empty( $theme ) || empty( $theme->get( 'ThemeURI' ) ) ) {
			return [
				'files' => [],
				'manifest' => [],
			];
		}

		$themes_data['name'] = $theme->get( 'Name' );
		$themes_data['theme_uri'] = $theme->get( 'ThemeURI' );
		$themes_data['version'] = $theme->get( 'Version' );
		$themes_data['slug'] = $theme->get_stylesheet();

		$manifest_data['themes'] = $themes_data;

		return [
			'files' => [],
			'manifest' => [
				$manifest_data,
			],
		];
	}
}
