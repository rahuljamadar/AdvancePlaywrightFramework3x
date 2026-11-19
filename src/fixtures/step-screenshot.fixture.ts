import { test as base, type ConsoleMessage } from '@playwright/test';
import { beginStepLogCapture, endStepLogCapture, stepLog } from '../utils/logger';

export type StepFunction = (title: string, body: () => Promise<void>) => Promise<void>;

export const test = base.extend<{ step: StepFunction }>({
    step: async ({ page }, use, testInfo) => {
        let stepIndex = 0;

        const onConsole = (message: ConsoleMessage): void => {
            stepLog(`[browser:${message.type()}] ${message.text()}`);
        };
        const onPageError = (error: Error): void => {
            stepLog(`[pageerror] ${error.message}`);
        };
        page.on('console', onConsole);
        page.on('pageerror', onPageError);

        const step: StepFunction = async (title, body) => {
            const currentIndex = stepIndex++;

            await base.step(title, async () => {
                beginStepLogCapture();
                try {
                    await body();
                } finally {
                    try {
                        const screenshot = await page.screenshot();
                        await testInfo.attach(`step-${currentIndex}-screenshot`, {
                            body: screenshot,
                            contentType: 'image/png',
                        });
                    } catch {
                    }

                    try {
                        const logs = endStepLogCapture();
                        if (logs.length > 0) {
                            await testInfo.attach(`step-${currentIndex}-logs`, {
                                body: logs.join('\n'),
                                contentType: 'text/plain',
                            });
                        }
                    } catch {
                    }
                }
            });
        };

        await use(step);

        page.off('console', onConsole);
        page.off('pageerror', onPageError);
    },
});

export { expect } from '@playwright/test';
