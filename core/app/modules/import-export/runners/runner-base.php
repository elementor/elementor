<?php

namespace Elementor\Core\App\Modules\ImportExport\Runners;

abstract class Runner_Base {
	const IMPORT_SESSION_META_KEY = '_elementor_import_session_id';

	/**
	 * @return string
	 */
	public static function get_name() {
		throw new \Exception( 'You must implement `get_name()` inside ' . static::class );
	}

	/**
	 * By the passed data we should decide if we want to run the import function of the runner or not.
	 *
	 * @param array $data
	 *
	 * @return bool
	 */
	abstract public function should_import( array $data );

	/**
	 * By the passed data we should decide if we want to run the export function of the runner or not.
	 *
	 * @param array $data
	 *
	 * @return bool
	 */
	abstract public function should_export( array $data );

	/**
	 * By the passed data we should decide if we want to run the revert function of the runner or not.
	 *
	 * @param array $data
	 *
	 * @return bool
	 */
	abstract public function should_revert( array $data );

	/**
	 * Main function of the runner import process.
	 *
	 * @param array $data Necessary data for the import process.
	 * @param array $imported_data Data that already imported by previously runners.
	 *
	 * @return array The result of the import process
	 */
	abstract public function import( array $data, array $imported_data );

	/**
	 * Main function of the runner export process.
	 *
	 * @param array $data Necessary data for the export process.
	 *
	 * @return array{files: array, manifest: array}
	 * The files that should be part of the kit and the relevant manifest data.
	 */
	abstract public function export( array $data );

	/**
	 * Main function of the runner revert process.
	 *
	 * @param array $data Necessary data for the revert process.
	 */
	abstract public function revert( array $data );

	public function set_session_post_meta( $post_id, $meta_value ) {
		update_post_meta( $post_id, static::IMPORT_SESSION_META_KEY, $meta_value );
	}

	public function set_session_term_meta( $term_id, $meta_value ) {
		update_term_meta( $term_id, static::IMPORT_SESSION_META_KEY, $meta_value );
	}
}
