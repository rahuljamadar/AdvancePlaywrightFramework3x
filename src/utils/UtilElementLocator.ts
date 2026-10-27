import { expect, type FrameLocator, type Locator, type Page } from '@playwright/test';
import { createLogger, type Logger } from './logger';

export type LocatorRoot = Page | Locator | FrameLocator;
export type RoleType = Parameters<Page['getByRole']>[0];
export type RoleOptions = Parameters<Page['getByRole']>[1];
export type MatchOptions = Parameters<Page['getByText']>[1];
export type ClickOptions = Parameters<Locator['click']>[0];
export type FillOptions = Parameters<Locator['fill']>[1];
export type PressOptions = Parameters<Locator['press']>[1];
export type TypeOptions = Parameters<Locator['pressSequentially']>[1];
export type SelectValues = Parameters<Locator['selectOption']>[0];
export type SelectOptions = Parameters<Locator['selectOption']>[1];

export type FlexLocator =
    | { by: 'testId'; selector: string }
    | { by: 'role'; selector: RoleType; options?: RoleOptions }
    | { by: 'text'; selector: string | RegExp; options?: MatchOptions }
    | { by: 'label'; selector: string | RegExp; options?: MatchOptions }
    | { by: 'placeholder'; selector: string | RegExp; options?: MatchOptions }
    | { by: 'altText'; selector: string | RegExp; options?: MatchOptions }
    | { by: 'title'; selector: string | RegExp; options?: MatchOptions }
    | { by: 'css'; selector: string }
    | { by: 'xpath'; selector: string }
    | { by: 'selector'; selector: string };

export class UtilElementLocator {
    readonly page: Page;
    readonly root: LocatorRoot;
    private readonly logger: Logger;

    constructor(page: Page, root?: LocatorRoot, logger: Logger = createLogger('UtilElementLocator')) {
        this.page = page;
        this.root = root ?? page;
        this.logger = logger;
    }

    for(root: LocatorRoot): UtilElementLocator {
        return new UtilElementLocator(this.page, root, this.logger);
    }

    byTestId(testId: string): Locator {
        return this.root.getByTestId(testId);
    }

    byRole(role: RoleType, options?: RoleOptions): Locator {
        return this.root.getByRole(role, options);
    }

    byText(text: string | RegExp, options?: MatchOptions): Locator {
        return this.root.getByText(text, options);
    }

    byLabel(text: string | RegExp, options?: MatchOptions): Locator {
        return this.root.getByLabel(text, options);
    }

    byPlaceholder(text: string | RegExp, options?: MatchOptions): Locator {
        return this.root.getByPlaceholder(text, options);
    }

    byAltText(text: string | RegExp, options?: MatchOptions): Locator {
        return this.root.getByAltText(text, options);
    }

    byTitle(text: string | RegExp, options?: MatchOptions): Locator {
        return this.root.getByTitle(text, options);
    }

    byCss(selector: string): Locator {
        return this.root.locator(selector);
    }

    byXpath(selector: string): Locator {
        return this.root.locator(`xpath=${selector}`);
    }

    bySelector(selector: string): Locator {
        return this.root.locator(selector);
    }

    byFrame(selector: string): FrameLocator {
        return this.root.frameLocator(selector);
    }

    locate(spec: FlexLocator | string): Locator {
        if (typeof spec === 'string') {
            return this.bySelector(spec);
        }

        switch (spec.by) {
            case 'testId':
                return this.byTestId(spec.selector);
            case 'role':
                return this.byRole(spec.selector, spec.options);
            case 'text':
                return this.byText(spec.selector, spec.options);
            case 'label':
                return this.byLabel(spec.selector, spec.options);
            case 'placeholder':
                return this.byPlaceholder(spec.selector, spec.options);
            case 'altText':
                return this.byAltText(spec.selector, spec.options);
            case 'title':
                return this.byTitle(spec.selector, spec.options);
            case 'css':
                return this.byCss(spec.selector);
            case 'xpath':
                return this.byXpath(spec.selector);
            case 'selector':
            default:
                return this.bySelector(spec.selector);
        }
    }

    async click(locator: Locator, options?: ClickOptions): Promise<void> {
        this.trace('click', locator);
        await locator.click(options);
    }

    async doubleClick(locator: Locator, options?: ClickOptions): Promise<void> {
        this.trace('doubleClick', locator);
        await locator.dblclick(options);
    }

    async fill(locator: Locator, value: string, options?: FillOptions): Promise<void> {
        this.trace('fill', locator);
        await locator.fill(value, options);
    }

    async clear(locator: Locator): Promise<void> {
        this.trace('clear', locator);
        await locator.clear();
    }

    async press(locator: Locator, key: string, options?: PressOptions): Promise<void> {
        this.trace('press', locator);
        await locator.press(key, options);
    }

    async type(locator: Locator, text: string, options?: TypeOptions): Promise<void> {
        this.trace('type', locator);
        await locator.pressSequentially(text, options);
    }

    async selectOption(locator: Locator, values: SelectValues, options?: SelectOptions): Promise<string[]> {
        this.trace('selectOption', locator);
        return locator.selectOption(values, options);
    }

    async check(locator: Locator, options?: ClickOptions): Promise<void> {
        this.trace('check', locator);
        await locator.check(options);
    }

    async uncheck(locator: Locator, options?: ClickOptions): Promise<void> {
        this.trace('uncheck', locator);
        await locator.uncheck(options);
    }

    async hover(locator: Locator, options?: ClickOptions): Promise<void> {
        this.trace('hover', locator);
        await locator.hover(options);
    }

    async scrollIntoView(locator: Locator): Promise<void> {
        this.trace('scrollIntoView', locator);
        await locator.scrollIntoViewIfNeeded();
    }

    async text(locator: Locator): Promise<string> {
        return (await locator.innerText()).trim();
    }

    async texts(locator: Locator): Promise<string[]> {
        const values = await locator.allInnerTexts();
        return values.map((value) => value.trim());
    }

    async attribute(locator: Locator, name: string): Promise<string | null> {
        return locator.getAttribute(name);
    }

    async inputValue(locator: Locator): Promise<string> {
        return locator.inputValue();
    }

    async count(locator: Locator): Promise<number> {
        return locator.count();
    }

    async isVisible(locator: Locator): Promise<boolean> {
        return locator.isVisible();
    }

    async isEnabled(locator: Locator): Promise<boolean> {
        return locator.isEnabled();
    }

    async isChecked(locator: Locator): Promise<boolean> {
        return locator.isChecked();
    }

    async isEditable(locator: Locator): Promise<boolean> {
        return locator.isEditable();
    }

    async waitForVisible(locator: Locator, timeout?: number): Promise<void> {
        await locator.waitFor({ state: 'visible', timeout });
    }

    async waitForHidden(locator: Locator, timeout?: number): Promise<void> {
        await locator.waitFor({ state: 'hidden', timeout });
    }

    async waitForAttached(locator: Locator, timeout?: number): Promise<void> {
        await locator.waitFor({ state: 'attached', timeout });
    }

    async waitForDetached(locator: Locator, timeout?: number): Promise<void> {
        await locator.waitFor({ state: 'detached', timeout });
    }

    async waitForCount(locator: Locator, count: number, timeout?: number): Promise<void> {
        await expect(locator).toHaveCount(count, { timeout });
    }

    private trace(action: string, locator: Locator): void {
        this.logger.debug(`${action} ${String(locator)}`);
    }
}

export default UtilElementLocator;
