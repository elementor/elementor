<?php
namespace Elementor\App\Services;

abstract class Base_Service {
	abstract function get_name() : string;
	abstract function register();
}
