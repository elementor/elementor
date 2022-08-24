<?php

namespace Elementor\Core\App\Modules\ImportExport\Runners\Revert;

use Elementor\Core\App\Modules\ImportExport\Runners\Runner_Interface;

abstract class Revert_Runner_Base implements Runner_Interface {

	const IMPORT_SESSION_META_KEY = '_elementor_import_session_id';

	/**
	 * By the passed data we should decide if we want to run the revert function of the runner or not.
	 *
	 * @param array $data
	 *
	 * @return bool
	 */
	abstract public function should_revert( array $data );

	/**
	 * Main function of the runner revert process.
	 *
	 * @param array $data Necessary data for the revert process.
	 */
	abstract public function revert( array $data );
}
