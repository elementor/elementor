<?php
namespace Elementor\Modules\Apps;

use Elementor\Core\Isolation\Wordpress_Adapter;
use Elementor\Core\Isolation\Plugin_Status_Adapter;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Admin_Apps_Page {

	const APPS_URL = 'https://assets.elementor.com/apps/v1/apps.json';

	private static ?Wordpress_Adapter $wordpress_adapter = null;

	private static ?Plugin_Status_Adapter $plugin_status_adapter = null;

	public static function render() {
		?>
		<div class="wrap e-a-apps">

			<div class="e-a-page-title">
				<h2><?php echo esc_html__( 'Popular Add-ons, New Possibilities.', 'elementor' ); ?></h2>
				<p><?php echo esc_html__( 'Boost your web-creation process with add-ons, plugins, and more tools specially selected to unleash your creativity, increase productivity, and enhance your Elementor-powered website.', 'elementor' ); ?>*<br>
					<a href="https://go.elementor.com/wp-dash-apps-about-apps-page/" target="_blank"><?php echo esc_html__( 'Learn more about this page.', 'elementor' ); ?></a>
				</p>
			</div>

			<div class="e-a-list">
				<?php self::render_plugins_list(); ?>
			</div>
			<div class="e-a-page-footer">
<<<<<<< HEAD
				<p>*<?php echo esc_html__( 'Please note that certain tools and services on this page are developed by third-party companies and are not part of Elementor\'s suite of products or support. Before using them, we recommend independently evaluating them. Additionally, when clicking on their action buttons, you may be redirected to an external website.', 'elementor' ); ?></p>
=======
				<p><?php echo esc_html__( 'Please note that certain services on this page are developed by third-party companies. When you click on the their action button, you may be redirected to an external website.', 'elementor' ); ?></p>
>>>>>>> origin/3.16
			</div>
		</div>
		<?php
	}

	private static function render_plugins_list() {
		$plugins = self::get_plugins();

		foreach ( $plugins as $plugin ) {
			self::render_plugin_item( $plugin );
		}
	}

	private static function get_plugins() : array {
		if ( ! self::$wordpress_adapter ) {
			self::$wordpress_adapter = new Wordpress_Adapter();
		}

<<<<<<< HEAD
		if ( ! self::$plugin_status_adapter ) {
			self::$plugin_status_adapter = new Plugin_Status_Adapter( self::$wordpress_adapter );
		}
=======
		$plugins = [
			[
				'name' => 'Elementor AI',
				'author' => 'Elementor',
				'author_url' => 'https://go.elementor.com/wp-dash-apps-author-uri-elementor-ai/',
				'badge' => 'Premium',
				'description' => 'Boost creativity with Elementor AI. Craft & enhance copy, create custom CSS & Code, and generate images to elevate your website.',
				'action_label' => 'Let\'s Go',
				'action_url' => 'https://go.elementor.com/wp-dash-apps-go-to-elementor-ai/',
				'image' => $images_url . 'elementor.svg',
			],
			[
				'name' => 'JetPlugins Add-ons',
				'author' => 'Crocoblock',
				'author_url' => 'https://go.elementor.com/wp-dash-apps-author-uri-crocoblock/',
				'badge' => '10% Off',
				'description' => 'Unlock dynamic widgets, e-commerce features, and a powerful filtering system for enhanced website capabilities.',
				'offering' => 'Use coupon code: onlyforelementor',
				'action_label' => 'Let\'s Go',
				'action_url' => 'https://go.elementor.com/wp-dash-apps-go-to-crocoblock/',
				'image' => $images_url . 'crocoblock.png',
			],
			[
				'name' => 'Unlimited Elements',
				'author' => 'Unlimited Group',
				'author_url' => 'https://go.elementor.com/wp-dash-apps-author-uri-unlimited-elements/',
				'badge' => '20% Off',
				'description' => 'An all-in-one plugin that instantly gives you the most advanced tools to make better Elementor websites faster.',
				'offering' => 'Use coupon code: elementor20',
				'action_label' => 'Let\'s Go',
				'action_url' => 'https://go.elementor.com/wp-dash-apps-go-to-unlimited-elements/',
				'image' => $images_url . 'unlimited-elements.gif',
			],
			[
				'name' => 'Essential Addons',
				'author' => 'WPDeveloper',
				'author_url' => 'https://go.elementor.com/wp-dash-apps-author-uri-wpdeveloper/',
				'badge' => '20% Off',
				'description' => 'Essential Addons is the ultimate library for Elementor, with 1 Million+ users and 100+ widgets & extensions to enhance web-building & design experiences.',
				'offering' => 'Use coupon code: elementor20',
				'action_label' => 'Let\'s Go',
				'action_url' => 'https://go.elementor.com/wp-dash-apps-go-to-wpdeveloper/',
				'image' => $images_url . 'essential-addons.svg',
			],
			[
				'name' => 'Element Pack Pro',
				'author' => 'BdThemes Ltd',
				'author_url' => 'https://go.elementor.com/wp-dash-apps-author-uri-element-pack-pro/',
				'description' => 'Revolutionize your web design experience with 250+ powerful features, tailored for designers of all skill levels. Create websites without breaking a sweat!',
				'badge' => '10% Off',
				'offering' => 'Discount is automatically applied',
				'action_label' => 'Let\'s Go',
				'action_url' => 'https://go.elementor.com/wp-dash-apps-go-to-element-pack-pro/',
				'image' => $images_url . 'element-pack.gif',
			],
			[
				'name' => 'Ultimate Addons',
				'author' => 'Brainstorm Force',
				'author_url' => 'https://go.elementor.com/wp-dash-apps-author-uri-ultimate-elementor/',
				'description' => 'Ultimate Addons for Elementor is a powerful plugin with advanced widgets, templates, and features for designing stunning websites using Elementor.',
				'badge' => '25% Off',
				'offering' => 'Discount is automatically applied',
				'action_label' => 'Let\'s Go',
				'action_url' => 'https://go.elementor.com/wp-dash-apps-go-to-ultimate-elementor/',
				'image' => $images_url . 'uae.svg',
			],
			[
				'name' => 'Fiverr Logo Maker',
				'author' => 'Fiverr',
				'author_url' => 'https://go.elementor.com/wp-dash-apps-author-uri-fiverr/',
				'description' => 'Craft your brand\'s identity on Fiverr Logo Maker. Upload logo, choose typography & colors for versatile variations. Elevate your brand effortlessly.',
				'badge' => 'Premium',
				'action_label' => 'Let\'s Go',
				'action_url' => 'https://go.elementor.com/wp-dash-apps-author-uri-fiverr/',
				'image' => $images_url . 'fiverr.svg',
			],
			[
				'name' => 'Hover Custom Domains',
				'author' => 'Tucows',
				'author_url' => 'https://go.elementor.com/wp-dash-apps-author-uri-hover/',
				'description' => 'Elevate your website with a custom domain for maximum online impact. Enjoy exclusive Elementor user discounts through our Hover partnership.',
				'badge' => '10% Off',
				'offering' => 'Discount is automatically applied',
				'action_label' => 'Let\'s Go',
				'action_url' => 'https://go.elementor.com/wp-dash-apps-go-to-hover/',
				'image' => $images_url . 'hover.svg',
			],
		];
>>>>>>> origin/3.16

		$apps = static::get_remote_apps();

		return static::filter_apps( $apps );
	}

	private static function get_remote_apps() {
		$apps = wp_remote_get( static::APPS_URL );

		if ( is_wp_error( $apps ) ) {
			return [];
		}

		$apps = json_decode( wp_remote_retrieve_body( $apps ), true );

		if ( empty( $apps['apps'] ) || ! is_array( $apps['apps'] ) ) {
			return [];
		}

		return $apps['apps'];
	}

	private static function filter_apps( $apps ) {
		$filtered_apps = [];

		foreach ( $apps as $app ) {
			if ( static::is_wporg_app( $app ) ) {
				$app = static::filter_wporg_app( $app );
			}

			if ( static::is_ecom_app( $app ) ) {
				$app = static::filter_ecom_app( $app );
			}

			if ( empty( $app ) ) {
				continue;
			}

			$filtered_apps[] = $app;
		}

		return $filtered_apps;
	}

	private static function is_wporg_app( $app ) {
		return isset( $app['type'] ) && 'wporg' === $app['type'];
	}

	private static function filter_wporg_app( $app ) {
		if ( self::$wordpress_adapter->is_plugin_active( $app['file_path'] ) ) {
			return null;
		}

		if ( self::$plugin_status_adapter->is_plugin_installed( $app['file_path'] ) ) {
			if ( current_user_can( 'activate_plugins' ) ) {
				$app['action_label'] = esc_html__( 'Activate', 'elementor' );
				$app['action_url'] = self::$plugin_status_adapter->get_activate_plugin_url( $app['file_path'] );
			} else {
				$app['action_label'] = esc_html__( 'Cannot Activate', 'elementor' );
				$app['action_url'] = '#';
			}
		} else {
			if ( current_user_can( 'install_plugins' ) ) {
				$app['action_label'] = esc_html__( 'Install', 'elementor' );
				$app['action_url'] = self::$plugin_status_adapter->get_install_plugin_url( $app['file_path'] );
			} else {
				$app['action_label'] = esc_html__( 'Cannot Install', 'elementor' );
				$app['action_url'] = '#';
			}
		}

		return $app;
	}

	private static function is_ecom_app( $app ) {
		return isset( $app['type'] ) && 'ecom' === $app['type'];
	}

	private static function filter_ecom_app( $app ) {
		if ( self::$wordpress_adapter->is_plugin_active( $app['file_path'] ) ) {
			return null;
		}

		if ( ! self::$plugin_status_adapter->is_plugin_installed( $app['file_path'] ) ) {
			return $app;
		}

		if ( current_user_can( 'activate_plugins' ) ) {
			$app['action_label'] = esc_html__( 'Activate', 'elementor' );
			$app['action_url'] = self::$plugin_status_adapter->get_activate_plugin_url( $app['file_path'] );
		} else {
			$app['action_label'] = esc_html__( 'Cannot Activate', 'elementor' );
			$app['action_url'] = '#';
		}

		$app['target'] = '_self';

		return $app;
	}

	private static function get_images_url() {
		return ELEMENTOR_URL . 'modules/apps/images/';
	}

	private static function is_elementor_pro_installed() {
		return defined( 'ELEMENTOR_PRO_VERSION' );
	}

	private static function render_plugin_item( $plugin ) {
		?>
		<div class="e-a-item"<?php echo ! empty( $plugin['file_path'] ) ? ' data-plugin="' . esc_attr( $plugin['file_path'] ) . '"' : ''; ?>>
			<div class="e-a-heading">
				<img class="e-a-img" src="<?php echo esc_url( $plugin['image'] ); ?>" alt="<?php echo esc_attr( $plugin['name'] ); ?>">
				<?php if ( ! empty( $plugin['badge'] ) ) : ?>
					<span class="e-a-badge"><?php echo esc_html( $plugin['badge'] ); ?></span>
				<?php endif; ?>
			</div>
			<h3 class="e-a-title"><?php echo esc_html( $plugin['name'] ); ?></h3>
			<p class="e-a-author"><?php esc_html_e( 'By', 'elementor' ); ?> <a href="<?php echo esc_url( $plugin['author_url'] ); ?>" target="_blank"><?php echo esc_html( $plugin['author'] ); ?></a></p>
			<div class="e-a-desc">
				<p><?php echo esc_html( $plugin['description'] ); ?></p>
				<?php if ( ! empty( $plugin['offering'] ) ) : ?>
					<p class="e-a-offering"><?php echo esc_html( $plugin['offering'] ); ?></p>
				<?php endif; ?>
			</div>

			<p class="e-a-actions">
				<?php if ( ! empty( $plugin['learn_more_url'] ) ) : ?>
					<a class="e-a-learn-more" href="<?php echo esc_url( $plugin['learn_more_url'] ); ?>" target="_blank"><?php echo esc_html__( 'Learn More', 'elementor' ); ?></a>
				<?php endif; ?>
				<a href="<?php echo esc_url( $plugin['action_url'] ); ?>" class="e-btn e-accent" target="<?php echo isset( $plugin['target'] ) ? esc_attr( $plugin['target'] ) : '_blank'; ?>"><?php echo esc_html( $plugin['action_label'] ); ?></a>
			</p>
		</div>
		<?php
	}
}
