<?php

namespace Elementor\Core\App\Modules\ImportExport\Content;

abstract class Runner_Base {
	/**
	 * @param array $data Contains all the necessary data for deciding if we should import or not.
	 * @return bool
	 */
	abstract public function should_import( $data );

	abstract public function should_export( $data );

	/**
	 * @param array $data Contains all the necessary data for importing the data.
	 * @return array The array will contain the data of the import process under the relevant key.
	 */
	abstract public function import( $data, $imported_data );

	abstract public function export( $data );
}
