<?php
namespace Elementor\Core\Import_Export;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Manager {

	const FORMAT_VERSION = '1.0';

	const EXPORT_TRIGGER_KEY = 'elementor_export_kit';

	const IMPORT_TRIGGER_KEY = 'elementor_import_kit';

	/**
	 * @var Export
	 */
	private $export;

	/**
	 * @var Import
	 */
	private $import;

	public function __construct() {
		add_action( 'elementor/init', [ $this, 'on_elementor_init' ] );
	}

	public function on_elementor_init() {
		if ( isset( $_GET[ self::EXPORT_TRIGGER_KEY ] ) ) {
			$this->export = new Export();
		}

		if ( isset( $_POST[ self::IMPORT_TRIGGER_KEY ] ) ) {
			$this->import = new Import();
		}

	}
}
