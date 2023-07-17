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
			<div class="e-a-page-footer">
				<p><?php echo esc_html__( 'Please note that certain services on this page are developed by third-party companies. When you click on the their action button, you may be redirected to an external website.', 'elementor' ); ?></p>
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
		$images_url = static::get_images_url();

		$plugins = [
			[
				'name' => 'Elementor AI',
				'author' => 'Elementor',
				'author_url' => 'https://elementor.com/',
				'badge' => 'Official',
				'description' => 'Revolutionize your Web Creation with AI. Available as a free trial with any Elementor website.',
				'learn_more_url' => 'https://elementor.com/',
				'action_label' => 'Try Now',
				'action_url' => 'https://elementor.com/',
				'image' => $images_url . 'elementor.svg',
			],
			[
				'name' => 'Activity Log',
				'author' => 'Activity Log Team',
				'author_url' => 'https://activitylog.io/',
				'badge' => 'Free',
				'description' => 'Activity Log is the easiest way to keep track of your user activity. Find out exactly who does what on your website, and perform the most comprehensive security audit.',
				'learn_more_url' => 'https://activitylog.io/',
				'action_label' => 'Install',
				'action_url' => 'https://activitylog.io/',
				'image' => $images_url . 'activity-log.png',
			],
			[
				'name' => 'One Click Accessibility',
				'author' => 'One Click Accessibility',
				'author_url' => 'https://wpaccessibility.io/',
				'badge' => 'Free',
				'description' => 'Activity Log is the easiest way to keep track of your user activity. Find out exactly who does what on your website, and perform the most comprehensive security audit.',
				'learn_more_url' => 'https://activitylog.io/',
				'action_label' => 'Install',
				'action_url' => 'https://wpaccessibility.io/',
				'image' => $images_url . 'one-click-accessibility.png',
			],
			[
				'name' => 'JetPlugins Add-ons',
				'author' => 'Crocoblock',
				'author_url' => 'https://crocoblock.com/',
				'badge' => '10% Off',
				'description' => 'Unlock dynamic widgets, e-commerce features, and a powerful filtering system for enhanced website capabilities.',
				'learn_more_url' => 'https://crocoblock.com/',
				'action_label' => 'Buy Now',
				'action_url' => 'https://crocoblock.com/',
				'image' => $images_url . 'crocoblock.png',
			],
			[
				'name' => 'Unlimited Elements',
				'author' => 'Unlimited Group',
				'author_url' => 'https://unlimited-elements.com/',
				'badge' => '10% Off',
				'description' => 'An all-in-one plugin that instantly gives you the most advanced tools to make better Elementor websites faster.',
				'learn_more_url' => 'https://crocoblock.com/',
				'action_label' => 'Buy Now',
				'action_url' => 'https://unlimited-elements.com/elementor-partners',
				'image' => $images_url . 'unlimited-elements.gif',
			],
			[
				'name' => 'Essential Addons',
				'author' => 'WP Developer',
				'author_url' => 'https://essential-addons.com/',
				'description' => 'Essential Addons is the ultimate library for Elementor, with 1 Million+ users and 100+ widgets & extensions to enhance web-building & design experiences.',
				'learn_more_url' => 'https://essential-addons.com/elementor/core-demo',
				'action_label' => 'Buy Now',
				'action_url' => 'https://wpdeveloper.com/plugins/essential-addons-elementor/?via=3908&campaign=Partner%20Page',
				'image' => $images_url . 'essential-addons.svg',
			],
			[
				'name' => 'Element Pack Pro addon',
				'author' => 'BdThemes Ltd',
				'author_url' => 'https://bdthemes.com/',
				'description' => 'Revolutionize your web design experience with 250+ powerful features, tailored for designers of all skill levels. Create websites without breaking a sweat!',
				'learn_more_url' => 'https://bdthemes.com/',
				'action_label' => 'Buy Now',
				'action_url' => 'https://www.elementpack.pro/',
				'image' => $images_url . 'element-pack.gif',
			],
		];

		if ( ! static::is_elementor_pro_installed() ) {
			array_unshift( $plugins, [
				'name' => 'Elementor Pro',
				'author' => 'Elementor',
				'author_url' => 'https://elementor.com/',
				'badge' => 'Official',
				'description' => 'Elevate your designs and unlock the full power of Elementor. Gain access to dozens of Pro widgets and kits, Theme Builder, Pop Ups, Forms and WooCommerce building capabilities.',
				'learn_more_url' => 'https://elementor.com/pro/',
				'action_label' => 'Upgrade Now',
				'action_url' => 'https://elementor.com/pro/',
				'image' => $images_url . 'elementor.svg',
			] );
		}

		return $plugins;
	}

	private static function get_images_url() {
		return ELEMENTOR_URL . 'modules/apps/assets/images/';
	}

	private static function is_elementor_pro_installed() {
		return defined( 'ELEMENTOR_PRO_VERSION' );
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
				<a href="<?php echo esc_url( $plugin['action_url'] ); ?>" class="e-btn e-accent" target="_blank"><?php echo esc_html( $plugin['action_label'] ); ?></a>
			</p>
		</div>
		<?php
	}
}
