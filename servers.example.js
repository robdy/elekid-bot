module.exports = {
  '481777963805966344': { // robdy
    sources: {
      // post all
      postByDefault: '555040742935101451',
      redirects: {
        // but create redirect for Twitter ID 2899773086 to specified channel
        2899773086: '513999493042012171',
      },
    },
  },
  '481777963805966345': { // forTesting
    sources: {
      // post all
      postByDefault: '555040742935101452',
      // with not redirections
    },
  },
  '481777963805966346': { // forTesting
    sources: {
      // post nothing at all
      postByDefault: '',
    },
  },
  '481777963805966347': { // forTesting
    sources: {
      // post all
      postByDefault: '555040742935101453',
      redirects: {
        // but not post 2899773086
        2899773086: '',
      },
    },
  },
  '481777963805966348': { // forTesting
    sources: {
      // post nothing by default
      postByDefault: '',
      redirects: {
        2899773086: '555040742935101454',
      },
    },
  },
};
