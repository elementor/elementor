<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

abstract class Scheme_Base implements Scheme_Interface {

	public function get_scheme_value() {
		$scheme_values = get_option( 'elementor_scheme_' . static::get_type() );

		if ( ! $scheme_values ) {
			$scheme_values = $this->get_default_scheme();

			update_option( 'elementor_scheme_' . static::get_type(), $scheme_values );
		}

		return $scheme_values;
	}

	public function save_scheme( $posted = [] ) {
		$scheme_values = [];

		foreach ( $this->get_scheme_titles() as $scheme_key => $scheme_title ) {
			if ( ! isset( $posted[ $scheme_key ] ) || ! isset( $posted[ $scheme_key ]['value'] ) ) {
				$scheme_value = $this->get_default_scheme()[ $scheme_key ];
			} else {
				$scheme_value = $posted[ $scheme_key ]['value'];
			}

			$scheme_values[ $scheme_key ] = $scheme_value;
		}

		update_option( 'elementor_scheme_' . static::get_type(), $scheme_values );
	}

	public function get_scheme() {
		$schemes = [];

		foreach ( $this->get_scheme_titles() as $scheme_key => $scheme_title ) {
			$schemes[ $scheme_key ] = [
				'title' => $scheme_title,
				'value' => $this->get_scheme_value()[ $scheme_key ],
			];
		}

		return $schemes;
	}
}
