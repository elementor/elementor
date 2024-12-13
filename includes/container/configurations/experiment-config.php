<?php

use Elementor\Controls_Manager;
use Elementor\Core\Breakpoints\Manager as Breakpoints_Manager;
use Elementor\Core\Debug\Inspector;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\DB;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor Dependency Injection Configuration.
 *
 * This file registers definitions for PHP-DI used by Elementor.
 *
 * @since 3.24.0
 */

return [
	'experiments.manager' => Experiments_Manager::class,
	'breakpoints.manager' => Breakpoints_Manager::class,
	'controls.manager' => Controls_Manager::class,
	'inspector' => Inspector::class,
	'db' => DB::class,
];
