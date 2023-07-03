<?php
namespace Elementor\Core\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Placeholder_Replacer {
	protected $placeholders = [];

	public function __construct( $placeholders ) {
		$this->placeholders = $placeholders;
	}

	public function replace( $str ) {
		foreach ( $this->placeholders as $placeholder => $replacement ) {
			$str = str_replace( $placeholder, $replacement, $str );
		}

		return $str;
	}
}
