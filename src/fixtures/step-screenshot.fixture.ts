import { test as base } from '@playwright/test';

export type StepFunction = (title: string, body: () => Promise<void>) => Promise<void>;

export const test = base.extend<{ step: StepFunction }>({
    step: async ({ page }, use, testInfo) => {
        let stepIndex = 0;

        const step: StepFunction = async (title, body) => {
            const currentIndex = stepIndex++;

            await base.step(title, async () => {
                try {
                    await body();
                } finally {
                    try {
                        const screenshot = await page.screenshot();
                        // Keep the `step-<index>-` prefix: CustomReporter uses it to map
                        // this attachment back to the matching test step.
                        await testInfo.attach(`step-${currentIndex}-screenshot`, {
                            body: screenshot,
                            contentType: 'image/png',
                        });
                    } catch {
                        // Best effort only - never let a screenshot failure mask the step result.
                    }
                }
            });
        };

        await use(step);
    },
});

export { expect } from '@playwright/test';
