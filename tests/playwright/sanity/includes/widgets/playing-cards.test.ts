import { expect, test} from "@playwright/test";
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorPage from '../../../pages/editor-page';
import PlayingCardContent from '../../../pages/widgets/playing-cards-page';
test.describe.only( 'Playing Cards', () => {
    test('it should display 1 playing card on adding the widget on default', async ({page}, testInfo) => {
        const wpAdmin: WpAdminPage = new WpAdminPage( page, testInfo );
        const editor: EditorPage = new EditorPage( page, testInfo );
        //creating new playing card
        await wpAdmin.openNewPage();
        await editor.closeNavigatorIfOpen();
        await editor.addWidget( 'playing-cards' );
        await editor.publishAndViewPage();
        //waiting for page to load
        await page.waitForLoadState('load')
        //tests
        const playingCardsWrapperElement = page.locator( '.elementor-playing-cards-wrapper');
        const playingCardsElements = page.locator( '.elementor-playing-card');
        await expect(playingCardsWrapperElement).toBeVisible()
        await expect(playingCardsElements).toHaveCount(1)
    })

    test('it should be able to add another playing card with the right values', async ({page}, testInfo) => {
        const wpAdmin: WpAdminPage = new WpAdminPage( page, testInfo );
        const editor: EditorPage = new EditorPage( page, testInfo );
        const playingCardContent: PlayingCardContent = new PlayingCardContent(page, testInfo)
        //creating new playing card
        await wpAdmin.openNewPage();
        await editor.closeNavigatorIfOpen();
        await editor.addWidget( 'playing-cards' );
        await playingCardContent.addNewCard( 'J', '♦' );
        await editor.publishAndViewPage();
        //waiting for page to load
        await page.waitForLoadState('load')
        //tests
        const playingCardsWrapperElement = page.locator( '.elementor-playing-cards-wrapper');
        const playingCardsElements = page.locator( '.elementor-playing-card');
        const firstPlayingCard = page.locator( '.elementor-playing-cards-wrapper').getByText('A♠')
        const secondPlayingCard = page.locator('.elementor-playing-cards-wrapper').getByText('J♦')

        await expect(playingCardsWrapperElement).toBeVisible()
        await expect(playingCardsElements).toHaveCount(2)
        await expect(firstPlayingCard).toBeVisible()
        await expect(secondPlayingCard).toBeVisible()
        await expect(firstPlayingCard).toHaveClass('elementor-playing-card-value elementor-playing-card-black')
        await expect(secondPlayingCard).toHaveClass('elementor-playing-card-value elementor-playing-card-red')
    });
});
