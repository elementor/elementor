<?php
namespace Elementor\Modules\WpCli;

use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class I18n extends \WP_CLI_Command {

	public function import( $args, $assoc_args ) {
		if ( empty( $assoc_args['file'] ) || empty( $assoc_args ['project'] ) ) {
			\WP_CLI::error( 'Arguments --file=<path-to-zip> and --project=<name> are required.' );
		}

		$wp_filesystem = $this->init_file_system();

		$target_file = $assoc_args['file'];
		$project_name = $assoc_args['project'];

		// Extract zip to tmp folder.
		$temp_dir = get_temp_dir() . Utils::generate_random_string();

		if ( file_exists( $temp_dir ) ) {
			$wp_filesystem->rmdir( $temp_dir, true );
		}

		$unzip_result = unzip_file( $target_file, $temp_dir );

		if ( is_wp_error( $unzip_result ) ) {
			\WP_CLI::error( sprintf( '%s (%s) ', $unzip_result->get_error_message(), $unzip_result->get_error_code() ) );
		}

		// Extract translations from plugin folder.
		$string_extractor = new i18n\Translations_Extractor();
		$translations = $string_extractor->extract_from_directory( $temp_dir, '/\.(php|js)$/' );

		// Remove tmp folder.
		$wp_filesystem->rmdir( $temp_dir, true );

		$gp_originals = new \GP_Original();

		$project = \GP::$project->by_path( $project_name );

		if ( ! $project ) {
			$project = new \GP_Project( [
				'name' => $project_name,
				'slug' => $project_name,
				'description' => $project_name,
			] );

			$project = \GP::$project->create_and_select( $project );
		}

		// Import translations.
		$result = $gp_originals->import_for_project( $project, $translations );
		$result = array_sum( $result );

		\WP_CLI::success( "Successfully imported '${result}' entries, archive ready at: '{$target_file}'" );
	}

	public function export( $args, $assoc_args ) {
		if ( empty( $assoc_args['file'] ) || empty( $assoc_args['project'] ) || empty( $assoc_args ['language'] ) ) {
			\WP_CLI::error( 'Arguments --file=<path-to-zip>, --project=<name>, --language=<lang> are required.' );
		}

		$target_file = $assoc_args['file'];
		$project_name = $assoc_args['project'];
		$language = $assoc_args['language'];
		$language_lowercase = strtolower( $language );

		$target_folder = pathinfo( $target_file, PATHINFO_DIRNAME );

		// Ensure target is writeable.
		wp_mkdir_p( $target_folder );
		if ( ! file_put_contents( $target_file, 'test' ) ) {
			\WP_CLI::error( "Cannot access location for creating the archive: '{$target_file}'" );
		}
		unlink( $target_file );

		// Find gp-locale by language.
		$gp_locale = null;
		foreach ( \GP_Locales::locales() as $slug => $locale ) {
			if ( strtolower( $locale->english_name ) === $language_lowercase ) {
				$gp_locale = $locale;
				break;
			}
		}
		if ( ! $gp_locale ) {
			\WP_CLI::error( "Cannot find GlotPress locale for language: '{$language}'" );
		}

		// Find the project.
		$gp_project = \GP::$project->by_path( $project_name );
		if ( ! $gp_project ) {
			\WP_CLI::error( "Invalid project path: $project_name." );
		}

		// Find translation for the project by language.
		$project_translation_set = null;
		$translations_set = \GP::$translation_set->by_project_id( $gp_project->id );
		if ( empty( $translations_set ) ) {
			\WP_CLI::error( "No translation set available for: '{$project_name}'." );
		}

		foreach ( $translations_set as $translation_set ) {
			if ( $translation_set->locale === $gp_locale->slug ) {
				$project_translation_set = $translation_set;
				break;
			}
		}

		if ( ! $project_translation_set ) {
			\WP_CLI::error( "Project: '{$project_name}' does not have translation for language: '${language}'." );
		}

		$entries = \GP::$translation->for_export( $gp_project, $project_translation_set, [ 'status' => 'current' ] );
		if ( ! $entries ) {
			\WP_CLI::error( "No current translations available for: '{$project_name}/{$project_translation_set->locale}/{$project_translation_set->slug}'." );
		}

		// Create temp folder for export.
		$temp_dir = get_temp_dir() . $language_lowercase;
		if ( file_exists( $temp_dir ) ) {
			$this->init_file_system()->rmdir( $temp_dir, true );
		}
		wp_mkdir_p( $temp_dir );

		// Export.
		$exporter = new i18n\Translations_Exporter( $entries, $gp_project, $gp_locale, $project_translation_set, $temp_dir );

		$files = [];
		try {
			$files = $exporter->run();
		} catch ( \Exception $e ) {
			\WP_CLI::error( $e->getMessage() );
		}

		// Archie the exported files.
		$zip = new \ZipArchive();
		if ( $zip->open( $target_file, \ZipArchive::CREATE ) === true ) {
			foreach ( $files as $file ) {
				$zip->addFile( $file, basename( $file ) );
			}
			$zip->close();
		}

		// Delete temp folder.
		$this->init_file_system()->rmdir( $temp_dir, true );

		\WP_CLI::success( "Successfully exported, archive ready at: '{$target_file}'" );
	}

	/**
	 * @returns \WP_Filesystem_Base
	 */
	private function init_file_system() {
		global $wp_filesystem;

		if ( $wp_filesystem ) {
			return $wp_filesystem;
		}

		if ( ! function_exists( 'WP_Filesystem' ) ) {
			require_once ABSPATH . 'wp-admin/includes/file.php';
		}

		WP_Filesystem();

		return $wp_filesystem;
	}

	public function __construct() {
		if ( ! defined( 'GP_PLUGIN_FILE' ) ) {
			\WP_CLI::error( ' i18n command cannot work without GlotPress.' );
		}
	}
}
