<?php
namespace Elementor\Modules\ProInstall;

class Plugin_Installer {

	private $plugin_slug;
	private $package_url;

	public function __construct( $plugin_slug, $package_url = null ) {
		$this->plugin_slug = $plugin_slug;
		$this->package_url = $package_url;
	}

	public function install() {
		$this->includes_dependencies();

		$plugin_data = $this->get_plugin_path();
		if ( empty( $plugin_data ) ) {
			$install_result = $this->do_install();
			if ( is_wp_error( $install_result ) ) {
				return $this->install_failed_error( $install_result->get_error_code() );
			}
			if ( null === $install_result ) {
				return $this->install_failed_error( 'install_failed' );
			}
		}

		$is_activated = $this->activate();
		if ( is_wp_error( $is_activated ) ) {
			return $is_activated;
		}

		return true;
	}

	private function install_failed_error( string $underlying_code ): \WP_Error {
		return new \WP_Error(
			'install_failed',
			esc_html__( 'We couldn\'t install Elementor Pro. Please try again.', 'elementor' ),
			[ 'error_code' => $underlying_code ]
		);
	}

	private function activate_failed_error( string $underlying_code ): \WP_Error {
		return new \WP_Error(
			'activate_failed',
			esc_html__( 'We couldn\'t activate Elementor Pro. Please try again.', 'elementor' ),
			[ 'error_code' => $underlying_code ]
		);
	}

	private function get_package_url() {
		return $this->package_url;
	}

	private function includes_dependencies() {
		include_once ABSPATH . '/wp-admin/includes/file.php';
		include_once ABSPATH . '/wp-admin/includes/plugin.php';
		include_once ABSPATH . '/wp-admin/includes/class-wp-upgrader.php';
		include_once ABSPATH . '/wp-admin/includes/class-wp-upgrader-skin.php';
		include_once ABSPATH . '/wp-admin/includes/class-automatic-upgrader-skin.php';
		include_once ABSPATH . '/wp-admin/includes/class-plugin-upgrader.php';
	}

	private function ensure_wp_filesystem() {
		global $wp_filesystem;

		if ( $wp_filesystem ) {
			return true;
		}

		if ( ! WP_Filesystem() ) {
			return new \WP_Error(
				'filesystem_unavailable',
				esc_html__( 'Could not access the filesystem.', 'elementor' )
			);
		}

		return true;
	}

	private function do_install() {
		$package_url = $this->get_package_url();
		if ( empty( $package_url ) ) {
			return new \WP_Error( 'no_package_url', sprintf( 'The requested plugin `%s` has no package URL', $this->plugin_slug ) );
		}

		$filesystem = $this->ensure_wp_filesystem();

		if ( is_wp_error( $filesystem ) ) {
			return $filesystem;
		}

		$upgrader = new \Plugin_Upgrader( new \Automatic_Upgrader_Skin() );
		$result = $upgrader->install( $package_url );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		if ( false === $result ) {
			return new \WP_Error(
				'install_failed',
				esc_html__( 'Elementor Pro could not be installed.', 'elementor' )
			);
		}

		return $result;
	}

	private function get_plugin_path() {
		$plugins = get_plugins();
		$installed_plugins = [];

		foreach ( $plugins as $path => $plugin ) {
			$path_parts = explode( '/', $path );
			$slug = $path_parts[0];
			$installed_plugins[ $slug ] = $path;
		}

		if ( empty( $installed_plugins[ $this->plugin_slug ] ) ) {
			return false;
		}

		return $installed_plugins[ $this->plugin_slug ];
	}

	public function activate() {
		$this->includes_dependencies();

		$filesystem = $this->ensure_wp_filesystem();

		if ( is_wp_error( $filesystem ) ) {
			return $this->activate_failed_error( $filesystem->get_error_code() );
		}

		$plugin_path = $this->get_plugin_path();

		if ( ! $plugin_path ) {
			return $this->activate_failed_error( 'no_installed' );
		}

		$activate_result = activate_plugin( $plugin_path, '', false, true );

		if ( is_wp_error( $activate_result ) ) {
			return $this->activate_failed_error( $activate_result->get_error_code() );
		}

		return true;
	}
}
