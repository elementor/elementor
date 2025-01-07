<?php
/*
Plugin Name: Elementor REST API example.
Plugin URI: https://elementor.com/
Description: Demo of using Elementor REST API.
*/

add_action( 'plugins_loaded', function () {
	// Load the controller.
	require 'house/controller.php';
	require 'house/keys/controller.php';
	require 'house/rooms/controller.php';
	require 'house/rooms/doors/controller.php';

	// Register the controllers.
	\Elementor\Data\V2\Manager::instance()->register_controller( House\Controller::class );
	\Elementor\Data\V2\Manager::instance()->register_controller( House\Keys\Controller::class );
	\Elementor\Data\V2\Manager::instance()->register_controller( House\Rooms\Controller::class );
	\Elementor\Data\V2\Manager::instance()->register_controller( House\Rooms\Doors\Controller::class );
} );
