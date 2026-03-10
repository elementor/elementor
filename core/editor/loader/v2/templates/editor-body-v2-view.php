<?php
namespace Elementor\Core\Editor\Loader\V2\Templates;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

$notice = Plugin::$instance->editor->notice_bar->get_notice();
// phpcs:ignore WordPress.Security.ValidatedSanitizedInput
$from_onboarding = ! empty( $_COOKIE['e_onboarding'] );
?>

<?php if ( $from_onboarding ) : ?>
<style>
#elementor-loading.e-from-onboarding {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 32px;
	font-family: var(--e-a-font-family);
}
#elementor-loading.e-from-onboarding .elementor-loader-wrapper { display: none; }
.e-ob-track {
	width: 192px;
	height: 4px;
	border-radius: 22px;
	background: var(--e-a-border-color-bold);
	position: relative;
	overflow: hidden;
}
.e-ob-fill {
	position: absolute;
	top: 0;
	left: -40%;
	height: 100%;
	width: 40%;
	border-radius: 22px;
	background: var(--e-a-color-txt-active);
	animation: e-ob-slide 1.5s linear infinite;
}
@keyframes e-ob-slide { 0% { left: -40%; } 100% { left: 140%; } }
.e-ob-text {
	text-align: center;
}
.e-ob-heading {
	margin: 0 0 8px;
	font-size: 24px;
	font-weight: 500;
	font-family: Poppins, var(--e-a-font-family);
	color: var(--e-a-color-txt-active);
}
.e-ob-subtext {
	margin: 0;
	font-size: 16px;
	font-family: var(--e-a-font-family);
	color: var(--e-a-color-txt-hover);
}
</style>
<?php endif; ?>

<div id="elementor-loading" <?php if ( $from_onboarding ) : ?>class="e-from-onboarding"<?php endif; ?>>
	<?php if ( $from_onboarding ) : ?>
	<script>document.cookie = 'e_onboarding=; path=/; max-age=0; SameSite=Lax';</script>
	<div class="e-ob-track"><div class="e-ob-fill"></div></div>
	<div class="e-ob-text">
		<p class="e-ob-heading"><?php echo esc_html__( 'Getting things ready', 'elementor' ); ?></p>
		<p class="e-ob-subtext"><?php echo esc_html__( 'Tailoring the editor to your goals and workflow…', 'elementor' ); ?></p>
	</div>
	<?php else : ?>
	<div class="elementor-loader-wrapper">
		<div class="elementor-loader" aria-hidden="true">
			<div class="elementor-loader-boxes">
				<div class="elementor-loader-box"></div>
				<div class="elementor-loader-box"></div>
				<div class="elementor-loader-box"></div>
				<div class="elementor-loader-box"></div>
			</div>
		</div>
		<div class="elementor-loading-title"><?php echo esc_html__( 'Loading', 'elementor' ); ?></div>
	</div>
	<?php endif; ?>
</div>

<h1 class="elementor-screen-only"><?php printf(
	/* translators: %s: Page title. */
	esc_html__( 'Edit "%s" with Elementor', 'elementor' ),
	esc_html( get_the_title() )
); ?></h1>

<div id="elementor-editor-wrapper-v2"></div>

<div id="elementor-editor-wrapper">
	<aside id="elementor-panel" class="elementor-panel" aria-labelledby="elementor-panel-header-title"></aside>
	<main id="elementor-preview" aria-label="<?php echo esc_attr__( 'Preview', 'elementor' ); ?>">
		<div id="elementor-responsive-bar"></div>
		<div id="elementor-preview-responsive-wrapper" class="elementor-device-desktop elementor-device-rotate-portrait">
			<div id="elementor-preview-loading">
				<i class="eicon-loading eicon-animation-spin" aria-hidden="true"></i>
			</div>
			<?php if ( $notice ) {
				$notice->render();
			} // IFrame will be created here by the Javascript later. ?>
		</div>
	</main>
	<aside id="elementor-navigator" aria-labelledby="elementor-navigator__header__title"></aside>
</div>
