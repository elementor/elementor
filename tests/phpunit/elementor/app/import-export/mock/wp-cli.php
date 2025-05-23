<?php

if ( ! class_exists( 'WP_CLI' ) ) {

	class WP_CLI
	{
		public static function __callStatic($name, $arguments) {}

		public static function error($message) {
			echo $message;
			die;
		}
	}
}

