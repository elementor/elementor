<?php

namespace Elementor\Core\App\Modules\ImportExport\Content;

abstract class Runner_Base {

	/**
	 * By the passed data we should decide if we want to run the import function of the runner or not.
	 *
	 * @param array $data Contains all the necessary data for deciding if we should import.
	 *
	 * @return bool
	 */
	abstract public function should_import( array $data );

	/**
	 * By the passed data we should decide if we want to run the export function of the runner or not.
	 *
	 * @param array $data Contains all the necessary data for deciding if we should export.
	 *
	 * @return bool
	 */
	abstract public function should_export( array $data );

	/**
	 * Main function of the runner import process.
	 *
	 * @param array $data Contains all the necessary data for the import process.
	 * @param array $imported_data Contains all the data that we already imported.
	 *
	 * @return array The array will contain the data of the import process under the relevant key.
	 */
	abstract public function import( array $data, array $imported_data );

	/**
	 * Main function of the runner export process.
	 *
	 * @param array $data Contains all the necessary data for the export process.
	 *
	 * @return array The array will contain the data of the export process under the relevant key.
	 */
	abstract public function export( array $data );
}
