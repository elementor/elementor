<?php
namespace Elementor\Core\Import_Export;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Manager {

	const FORMAT_VERSION = '1.0';

	const EXPORT_TRIGGER_KEY = 'elementor_export_kit';

	/**
	 * @var Export
	 */
	private $export;

	public function __construct() {
		add_action( 'elementor/init', [ $this, 'on_elementor_init' ] );
	}

	public function on_elementor_init() {
		if ( ! isset( $_GET[ self::EXPORT_TRIGGER_KEY ] ) ) {
			return;
		}

		$this->export = new Export();

		$this->export->run();
	}
}
