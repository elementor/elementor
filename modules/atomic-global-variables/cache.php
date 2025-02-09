<?php

namespace Elementor\Modules\AtomicGlobalVariables;

use Elementor\Core\Files\CSS\Post;
use Elementor\Core\Isolation\Wordpress_Adapter_Interface;
use Elementor\Modules\AtomicGlobalVariables\Classes\Variables;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Cache {
	const DB_KEY = 'elementor-atomic-global-variables';

	private Wordpress_Adapter_Interface $wo_adapter;

	public function __construct( Wordpress_Adapter_Interface $wp_adapter ) {
		$this->wp_adapter = $wp_adapter;
	}

	public function validate() {
		if ( $this->cache_expired() ) {
			$this->clear_kit_css_cache();
			$this->update_sginature();
		}

		return $this;
	}

	private function global_variables() {
		return ( new Variables( $this->wp_adapter ) )->get_all();
	}

	private function signature() {
		return sha1( serialize( $this->global_variables() ) );
	}

	private function cache_expired() {
		$signature = $this->wp_adapter->get_option( self::DB_KEY );

		return $signature !== $this->signature();
	}

	private function clear_kit_css_cache() {
		$kit_id = Plugin::$instance->kits_manager->get_active_id();

		Post::create( $kit_id )->delete();

		return $this;
	}

	private function update_sginature() {
		if ( ! $this->wp_adapter->get_option( self::DB_KEY ) ) {
			$this->wp_adapter->add_option( self::DB_KEY, $this->signature() );
			return $this;
		}

		$this->wp_adapter->update_option( self::DB_KEY, $this->signature() );

		return $this;
	}
}
