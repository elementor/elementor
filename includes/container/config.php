<?php

use Elementor\Core\Isolation\Wordpress_Adapter;
use Elementor\Core\Isolation\Wordpress_Adapter_Interface;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

return [
	Wordpress_Adapter_Interface::class => DI\autowire( Wordpress_Adapter::class ),
];
