<?php
namespace Elementor\App\Modules\ImportExport\Runners\Import;

use Automattic\WooCommerce\Admin\Overrides\ThemeUpgrader;
use Elementor\App\Modules\ImportExport\Utils as ImportExportUtils;
use Elementor\Core\Utils\Collection;

class Themes extends Import_Runner_Base {
	private $import_session_id;

	private Collection $installed_themes;

	/**
	 * @var ThemeUpgrader
	 */
	private ThemeUpgrader $theme_upgrader;

	public function __construct() {
		$this->theme_upgrader = new ThemeUpgrader( new ImportExportUtils() );
		$this->installed_themes = new Collection();
	}

	public static function get_name(): string {
		return 'themes';
	}

	public function should_import( array $data ) {
		return (
			isset( $data['include'] ) &&
			in_array( 'themes', $data['include'], true ) &&
			! empty( $data['extracted_directory_path'] ) &&
			! empty( $data['manifest']['themes'] )
		);
	}

	public function import( array $data, array $imported_data ) {
		$this->import_session_id = $data['session_id'];

		$themes = $data['manifest']['themes'];

		$existing_themes = Collection::make( $themes )
			->map( function( $theme ) {
				return $theme->get_stylesheet();
			} );

		$result = [];

		foreach ( $themes as $theme ) {
			try {
				if ( $existing_themes->contains( $theme['slug'] ) ) {
					continue;
				}

				$import = $this->install_theme( $theme['slug'], $theme['version'] );

				if ( is_wp_error( $import ) ) {
					/* translators: %s: Theme name. */
					$result['templates']['failed'][ $theme['slug'] ] = sprintf( __( 'Failed to install theme: %s', 'elementor' ), $theme['name'] );

					continue;
				}

				$result['templates']['succeed'][ $theme['slug'] ] = $import;
				$this->installed_themes->push( $theme['slug'] );
			} catch ( \Exception $error ) {
				$result['templates']['failed'][ $theme['slug'] ] = $error->getMessage();
			}
		}

		return $result;
	}

	private function install_theme( $slug, $version ) {
		return $this->theme_upgrader->install( "https://downloads.wordpress.org/theme/{$slug}.{$version}.zip" );
	}

	public function get_import_session_metadata(): array {
		return [
			'installed_themes' => $this->installed_themes->all(),
		];
	}
}
