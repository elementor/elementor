<?php

namespace Elementor\Core\App\Modules\ImportExport\Processes;

use Elementor\Core\App\Modules\ImportExport\Runners\Elementor_Content;
use Elementor\Core\App\Modules\ImportExport\Runners\Plugins;
use Elementor\Core\App\Modules\ImportExport\Runners\Runner_Base;
use Elementor\Core\App\Modules\ImportExport\Runners\Site_Settings;
use Elementor\Core\App\Modules\ImportExport\Runners\Taxonomies;
use Elementor\Core\App\Modules\ImportExport\Runners\Templates;
use Elementor\Core\App\Modules\ImportExport\Runners\Wp_Content;
use Elementor\Modules\System_Info\Reporters\Server;

abstract class Process_Base {
	const NO_WRITE_PERMISSIONS_KEY = 'no-write-permissions';

	abstract public function run();

	/**
	 * @var Runner_Base[]
	 */
	protected $runners = [];

	public function __construct() {
		$this->ensure_writing_permissions();
	}

	/**
	 * Register all the default runners the export can run. (e.g: elementor, plugins, etc.)
	 */
	public function register_default_runners() {
		$this->register( new Site_Settings() );
		$this->register( new Plugins() );
		$this->register( new Templates() );
		$this->register( new Taxonomies() );
		$this->register( new Elementor_Content() );
		$this->register( new Wp_Content() );
	}

	/**
	 * Register a runner.
	 *
	 * @param Runner_Base $runner_instance
	 */
	public function register( Runner_Base $runner_instance ) {
		$this->runners[ $runner_instance::get_name() ] = $runner_instance;
	}

	private function ensure_writing_permissions() {
		$server = new Server();

		$server_write_permissions = $server->get_write_permissions();

		if ( $server_write_permissions['warning'] ) {
			throw new \Error( self::NO_WRITE_PERMISSIONS_KEY );
		}
	}
}
