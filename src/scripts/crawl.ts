import { CheerioCrawler, Dataset, createCheerioRouter } from "crawlee";

const START_URL =
  "https://svenskarnaochinternet.se/rapporter/svenskarna-och-internet-2022/";

const main = async () => {
  const crawler = new CheerioCrawler({
    requestHandler: await createRouter(),
  });

  await crawler.run([{ url: START_URL, label: START_URL }]);
};

async function createRouter() {
  const dataset = await Dataset.open();

  const router = createCheerioRouter();

  router.addHandler(START_URL, async ({ enqueueLinks }) => {
    await enqueueLinks({
      globs: [`${START_URL}**`],
      exclude: [
        `https://svenskarnaochinternet.se/rapporter/svenskarna-och-internet-2022/summary-in-english/`,
      ],
    });
  });

  router.addDefaultHandler(async ({ $, request, enqueueLinks }) => {
    const content = $("main")
      .find("p,h1,h2,h3,ul,li,ol,blockquote")
      .filter(function (i, el) {
        return (
          !$(el).hasClass("wp-block-graph") &&
          !$(el).hasClass("wp-block-table") &&
          !$(el).is("script") &&
          !$(el).is("style")
        );
      })
      .text();

    const title = $("h1").first().text();

    await dataset.pushData({
      url: request.url,
      title,
      content,
    });

    await enqueueLinks({
      globs: [`${START_URL}**`],
      exclude: [
        `https://svenskarnaochinternet.se/rapporter/svenskarna-och-internet-2022/summary-in-english/`,
      ],
    });
  });

  return router;
}

void main();
