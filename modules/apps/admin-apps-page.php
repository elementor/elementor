<?php
namespace Elementor\Modules\Apps;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Admin_Apps_Page {

	public static function render() {
		?>
		<div class="wrap e-a-apps">

			<div class="e-a-page-title">
				<h2><?php echo esc_html__( 'Popular Apps, New Possibilities.', 'elementor' ); ?></h2>
				<p><?php echo esc_html__( 'Boost your web-creation process with add-ons, plugins, and more tools specially selected to unleash your creativity, increase productivity, and enhance your Elementor-powered website.', 'elementor' ); ?></p>
			</div>

			<div class="e-a-list">
				<?php self::render_plugins_list(); ?>
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
		return [
			[
				'name' => __( 'Elementor Pro', 'elementor' ),
				'author' => __( 'Elementor', 'elementor' ),
				'author_url' => 'https://elementor.com/',
				'description' => __( 'Elevate your designs and unlock the full power of Elementor. Gain access to dozens of Pro widgets and kits, Theme Builder, Pop Ups, Forms and WooCommerce building capabilities.', 'elementor' ),
				'learn_more_url' => 'https://elementor.com/',
				'action_label' => 'Upgrade Now',
				'action_url' => 'https://elementor.com/',
				'image' => 'https://ps.w.org/elementor/assets/icon-256x256.png',
			],
			[
				'name' => __( 'Elementor AI', 'elementor' ),
				'author' => __( 'Elementor', 'elementor' ),
				'author_url' => 'https://elementor.com/',
				'description' => __( 'Revolutionize your Web Creation with AI. Available as a free trial with any Elementor website.', 'elementor' ),
				'learn_more_url' => 'https://elementor.com/',
				'action_label' => 'Try Now',
				'action_url' => 'https://elementor.com/',
				'image' => 'https://ps.w.org/elementor/assets/icon-256x256.png',
			],
			[
				'name' => __( 'Activity Log', 'elementor' ),
				'author' => __( 'Activity Log Team', 'elementor' ),
				'author_url' => 'https://activitylog.io/',
				'description' => __( 'Activity Log is the easiest way to keep track of your user activity. Find out exactly who does what on your website, and perform the most comprehensive security audit.', 'elementor' ),
				'learn_more_url' => 'https://activitylog.io/',
				'action_label' => 'Install',
				'action_url' => 'https://activitylog.io/',
				'image' => 'https://ps.w.org/aryo-activity-log/assets/icon-256x256.png',
			],
			[
				'name' => __( 'One Click Accessibility', 'elementor' ),
				'author' => __( 'Activity Log Team', 'elementor' ),
				'author_url' => 'https://wpaccessibility.io/',
				'description' => __( 'Activity Log is the easiest way to keep track of your user activity. Find out exactly who does what on your website, and perform the most comprehensive security audit.', 'elementor' ),
				'learn_more_url' => 'https://activitylog.io/',
				'action_label' => 'Install',
				'action_url' => 'https://wpaccessibility.io/',
				'image' => 'https://ps.w.org/pojo-accessibility/assets/icon-256x256.png',
			],
			[
				'name' => __( 'JetPlugins Elementor Add-ons', 'elementor' ),
				'author' => __( 'Crocoblock', 'elementor' ),
				'author_url' => 'https://crocoblock.com/',
				'badge' => __( '10% Off', 'elementor' ),
				'description' => __( 'Unlock dynamic widgets, e-commerce features, and a powerful filtering system for enhanced website capabilities.', 'elementor' ),
				'learn_more_url' => 'https://crocoblock.com/',
				'action_label' => 'Buy Now',
				'action_url' => 'https://crocoblock.com/',
				'image' => 'https://ps.w.org/wordpress-seo/assets/icon-256x256.png',
			],
			[
				'name' => __( 'Unlimited Elements For Elementor', 'elementor' ),
				'author' => __( 'Unlimited Group', 'elementor' ),
				'author_url' => 'https://unlimited-elements.com/',
				'badge' => __( '10% Off', 'elementor' ),
				'description' => __( 'An all-in-one plugin that instantly gives you the most advanced tools to make better Elementor websites faster.', 'elementor' ),
				'learn_more_url' => 'https://crocoblock.com/',
				'action_label' => 'Buy Now',
				'action_url' => 'https://unlimited-elements.com/elementor-partners',
				'image' => 'https://ps.w.org/wordpress-seo/assets/icon-256x256.png',
			],
			[
				'name' => __( 'Essential Addons for Elementor', 'elementor' ),
				'author' => __( 'WP Developer', 'elementor' ),
				'author_url' => 'https://essential-addons.com/',
				'description' => __( 'Essential Addons is the ultimate library for Elementor, with 1 Million+ users and 100+ widgets & extensions to enhance web-building & design experiences.', 'elementor' ),
				'learn_more_url' => 'https://essential-addons.com/elementor/core-demo',
				'action_label' => 'Buy Now',
				'action_url' => 'https://wpdeveloper.com/plugins/essential-addons-elementor/?via=3908&campaign=Partner%20Page',
				'image' => 'https://ps.w.org/wordpress-seo/assets/icon-256x256.png',
			],
			[
				'name' => __( 'Cookiebot', 'elementor' ),
				'author' => __( 'Usercentrics', 'elementor' ),
				'author_url' => 'http://www.usercentrics.com/',
				'description' => __( 'Cookiebot™ is an easy-to-use and automated cookie banner. It makes your website’s use of cookies and online tracking compliant with data privacy laws.', 'elementor' ),
				'learn_more_url' => 'https://essential-addons.com/elementor/core-demo',
				'action_label' => 'Buy Now',
				'action_url' => 'https://wpdeveloper.com/plugins/essential-addons-elementor/?via=3908&campaign=Partner%20Page',
				'image' => 'https://ps.w.org/wordpress-seo/assets/icon-256x256.png',
			],
		];
	}

	private static function render_plugin_item( $plugin ) {
		?>
		<div class="e-a-item">
			<div class="e-a-heading">
				<img class="e-a-img" src="<?php echo esc_url( $plugin['image'] ); ?>" alt="<?php echo esc_attr( $plugin['name'] ); ?>">
				<?php if ( ! empty( $plugin['badge'] ) ) : ?>
					<span class="e-a-badge"><?php echo esc_html( $plugin['badge'] ); ?></span>
				<?php endif; ?>
			</div>
			<h3 class="e-a-title"><?php echo esc_html( $plugin['name'] ); ?></h3>
			<p class="e-a-author"><?php esc_html_e( 'By', 'elementor' ); ?> <a href="<?php echo esc_url( $plugin['author_url'] ); ?>" target="_blank"><?php esc_html_e( $plugin['author'], 'elementor' ); ?></a></p>
			<p class="e-a-desc"><?php echo esc_html( $plugin['description'] ); ?></p>
			<p class="e-a-actions">
				<?php if ( ! empty( $plugin['learn_more_url'] ) ) : ?>
					<a class="e-a-learn-more" href="<?php echo esc_url( $plugin['learn_more_url'] ); ?>" target="_blank"><?php echo esc_html__( 'Learn More', 'elementor' ); ?></a>
				<?php endif; ?>
				<a href="<?php echo esc_url( $plugin['action_url'] ); ?>" class="e-button e-accent" target="_blank"><?php echo esc_html( $plugin['action_label'] ); ?></a>
			</p>
		</div>
		<?php
	}
}
