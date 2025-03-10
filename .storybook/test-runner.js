const { toMatchImageSnapshot } = require('jest-image-snapshot');

module.exports = {
  setup() {
    expect.extend({ toMatchImageSnapshot });
  },
  async postRender(page, context) {
    // If you want to create visual snapshots of your stories
    if (context.parameters.captureSnapshot !== false) {
      const image = await page.screenshot();
      expect(image).toMatchImageSnapshot({
        customSnapshotsDir: `__image_snapshots__/${context.id}`,
        customSnapshotIdentifier: context.id,
      });
    }
  },
};