<?php

namespace Elementor\Core\Import_Export\Directories;

use Elementor\Core\Import_Export\Export;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Base {

	/**
	 * @var Base[]
	 */
	private $sub_directories = [];

	/**
	 * @var Base
	 */
	private $parent;

	/**
	 * @var Export
	 */
	public $exporter;

	abstract protected function get_name();

	/**
	 * @return array
	 */
	protected function export() {
		return [];
	}

	protected function get_default_sub_directories(){
		return [];
	}

	public function __construct( Export $exporter, Base $parent = null ) {
		$this->exporter = $exporter;

		$this->parent = $parent;

		$this->register_directories();
	}

	final public function get_path() {
		$path = $this->get_name();

		if ( $this->parent ) {
			$path = $this->parent->get_name() . '/' . $path;
		}

		return $path;
	}

	final public function run_export() {
		$this->exporter->set_current_archive_path( $this->get_path() );

		$manifest_data = $this->export();

		foreach( $this->sub_directories as $sub_directory ) {
			$manifest_data[ $sub_directory->get_name() ] = $sub_directory->run_export();
		}

		return $manifest_data;
	}

	public function register_directories() {
		$sub_directories = $this->get_default_sub_directories();

		$this->sub_directories = apply_filters( 'elementor/kits/import-export/directory/' . $this->get_path(), $sub_directories, $this );
	}
}
