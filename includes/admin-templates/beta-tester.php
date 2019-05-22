<?php
namespace Elementor;

use Elementor\Core\Admin\Admin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

$user = wp_get_current_user();
$ajax = Plugin::$instance->common->get_component( 'ajax' );

/**
 * Print beta tester dialog.
 *
 * Display a dialog box to suggest the user to opt-in to the beta testers newsletter.
 *
 * Fired by `admin_footer` filter.
 *
 * @since 2.6.0
 * @access public
 */
?>
<script type="text/template" id="tmpl-elementor-beta-tester">
	<form id="elementor-beta-tester-dialog-form" method="post">
		<input type="hidden" name="_nonce" value="<?php echo $ajax->create_nonce(); ?>">
		<input type="hidden" name="action" value="elementor_beta_tester_newsletter" />

		<div id="elementor-beta-tester-dialog-form-caption"><?php echo __( 'Beta Testers Newsletter', 'elementor' ); ?></div>
		<div id="elementor-beta-tester-dialog-form-body">
			<div>
				<?php
				echo __( 'Want to be the first to hear about new features & software improvements? leave your email below', 'elementor' );
				?>
			</div>
			<div class="elementor-beta-tester-dialog-input-wrapper">
				<input id="elementor-beta-tester-email" class="elementor-beta-tester-dialog-input" name="beta_tester_email" type="email" required value="<?php echo $user->user_email; ?>" />
				<button id="elementor-beta-tester-submit" class="elementor-button elementor-button-success"">
					<span class="elementor-state-icon">
						<i class="fa fa-spin fa-circle-o-notch" aria-hidden="true"></i>
					</span>
					<span id="elementor-beta-tester-submit-label">
						<?php echo esc_attr__( 'Sign Up', 'elementor' ); ?>
					</span>
				</button>
			</div>
			<div class="beta-tester-terms">
				<?php
				echo sprintf( '%s<a href="%s">%s</a> %s <a href="%s">%s</a>', __( 'By entering your email, you agree to Elementor\'s ', 'elementor' ), Admin::BETA_TESTER_NEWSLETTER_TERMS_URL, __( 'Terms of Service', 'elementor' ), __( 'and', 'elementor' ), Admin::BETA_TESTER_NEWSLETTER_PRIVACY_URL, __( 'Privacy Policy', 'elementor' ) );
				?>
			</div>
		</div>
	</form>
</script>
