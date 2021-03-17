<?php
/**
 * Based on https://meta.trac.wordpress.org/browser/sites/trunk/wordpress.org/public_html/wp-content/plugins/wporg-gp-customizations/inc/cli/class-export.php
 */

namespace Elementor\Modules\WpCli\i18n;

use GP;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Translations_Exporter {
	/**
	 * @var \Translation_Entry[]
	 */
	private $entries;

	/**
	 * @var \GP_Project
	 */
	private $gp_project;

	/**
	 * @var \GP_Locale
	 */
	private $gp_locale;

	/**
	 * @var \GP_Translation_Set
	 */
	private $translation_set;

	/**
	 * @var string
	 */
	private $dest_folder;

	/**
	 * @param \Translation_Entry[] $entries $entries
	 * @param \GP_Project          $gp_project
	 * @param \GP_Locale           $gp_locale
	 * @param \GP_Translation_Set  $translation_set
	 * @param string               $dest_folder
	 */
	public function __construct( $entries, $gp_project, $gp_locale, $translation_set, $dest_folder ) {
		$this->entries = $entries;
		$this->gp_project = $gp_project;
		$this->gp_locale = $gp_locale;
		$this->translation_set = $translation_set;
		$this->dest_folder = $dest_folder;
	}

	/**
	 * Run export.
	 *
	 * @return array files
	 *
	 * @throws \Exception
	 */
	public function run() {
		// Build a mapping based on where the translation entries occur and separate the po entries.
		$mapping = $this->build_mapping( $this->entries );
		$po_entries = array_key_exists( 'po', $mapping ) ? $mapping['po'] : array();

		unset( $mapping['po'] );

		$wp_locale = $this->translation_set->locale;
		$dest_folder = $this->dest_folder;

		// Create JED json files for each JS file.
		$json_file_base = "{$dest_folder}/{$wp_locale}";
		$jed_files = $this->build_json_files( $this->gp_project, $this->gp_locale, $this->translation_set, $mapping, $json_file_base );

		$files = $jed_files;

		// Create PO file.
		$po_file = "{$wp_locale}.po";
		$po_file = "{$dest_folder}/{$po_file}";
		$this->build_po_file( $this->gp_project, $this->gp_locale, $this->translation_set, $po_entries, $po_file );

		array_push( $files, $po_file );

		// Create MO file.
		$mo_file = "{$wp_locale}.mo";
		$mo_file = "{$dest_folder}/{$mo_file}";
		exec( sprintf( 'msgfmt %s -o %s 2>&1', escapeshellarg( $po_file ), escapeshellarg( $mo_file ) ), $output, $return_var );

		if ( $return_var ) {
			throw new \Exception( "Failure while creating: '{$mo_file}'." );
		}

		array_push( $files, $mo_file );

		return $files;
	}

	/**
	 * Build a mapping of JS files to translation entries occurring in those files.
	 * Translation entries occurring in other files are added to the 'po' key.
	 *
	 * @param \Translation_Entry[] $entries The translation entries to map.
	 *
	 * @return array The mapping of sources to translation entries.
	 */
	private function build_mapping( $entries ) {
		$mapping = array();

		foreach ( $entries as $entry ) {
			/** @var \Translation_Entry $entry */
			// Find all unique sources this translation originates from.
			if ( ! empty( $entry->references ) ) {
				$sources = array_map( function ( $reference ) {
					$parts = explode( ':', $reference );
					$file = $parts[0];

					if ( substr( $file, -7 ) === '.min.js' ) {
						return substr( $file, 0, -7 ) . '.js';
					}

					if ( substr( $file, -3 ) === '.js' ) {
						return $file;
					}

					return 'po';
				}, $entry->references );

				$sources = array_unique( $sources );
			} else {
				$sources = [ 'po' ];
			}

			foreach ( $sources as $source ) {
				$mapping[ $source ][] = $entry;
			}
		}

		return $mapping;
	}

	/**
	 * Builds a a separate JSON file with translations for each JavaScript file.
	 *
	 * @param \GP_Project         $gp_project The GlotPress project.
	 * @param \GP_Locale          $gp_locale  The GlotPress locale.
	 * @param \GP_Translation_Set $set        The translation set.
	 * @param array               $mapping    A mapping of files to translation entries.
	 * @param string              $base_dest  Destination file name.
	 *
	 * @return array An array of translation files built, may be empty if no translations in JS files exist.
	 */
	private function build_json_files( $gp_project, $gp_locale, $set, $mapping, $base_dest ) {
		$files = [];
		$format = gp_array_get( GP::$formats, 'jed1x' );

		foreach ( $mapping as $file => $entries ) {
			// Get the translations in Jed 1.x compatible JSON format.
			$json_content = $format->print_exported_file( $gp_project, $gp_locale, $set, $entries );

			// Decode and add comment with file reference for debugging.
			$json_content_decoded = json_decode( $json_content );
			$json_content_decoded->comment = [ 'reference' => $file ];

			$hash = md5( $file );
			$dest = "{$base_dest}-{$hash}.json";

			/*
			 * Merge translations into an existing JSON file.
			 *
			 * Some strings occur in multiple source files which may be used on the frontend
			 * or in the admin or both, thus they can be part of different translation
			 * projects (wp/dev, wp/dev/admin, wp/dev/admin/network).
			 * Unlike in PHP with gettext, where translations from multiple MO files are merged
			 * automatically, we have do merge the translations before shipping the
			 * single JSON file per reference.
			 */
			if ( file_exists( $dest ) ) {
				$existing_json_content_decoded = json_decode( file_get_contents( $dest ) );
				if ( isset( $existing_json_content_decoded->locale_data->messages ) ) {
					foreach ( $existing_json_content_decoded->locale_data->messages as $key => $translations ) {
						if ( ! isset( $json_content_decoded->locale_data->messages->{$key} ) ) {
							$json_content_decoded->locale_data->messages->{$key} = $translations;
						}
					}
				}
			}

			file_put_contents( $dest, wp_json_encode( $json_content_decoded ) );

			$files[] = $dest;
		}

		return $files;
	}

	/**
	 * Builds a PO file for translations.
	 *
	 * @param \GP_Project          $gp_project The GlotPress project.
	 * @param \GP_Locale           $gp_locale  The GlotPress locale.
	 * @param \GP_Translation_Set  $set        The translation set.
	 * @param \Translation_Entry[] $entries    The translation entries.
	 * @param string               $dest       Destination file name.
	 */
	private function build_po_file( $gp_project, $gp_locale, $set, $entries, $dest ) {
		$format = gp_array_get( GP::$formats, 'po' );
		$po_content = $format->print_exported_file( $gp_project, $gp_locale, $set, $entries );

		file_put_contents( $dest, $po_content );
	}
}
