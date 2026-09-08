import { expect, test } from "@playwright/test";

const article = "/what-if-we-applied-the-elm-architecture-to-sockets/";

test("shared votes survive disconnects and reconnects", async ({ page }) => {
  await page.goto(article);
  await expect(page.locator("socket-loop-demo")).toHaveCount(0);
  const demo = page.locator("shared-poll-demo");
  const alice = demo.getByRole("region", { name: "Alice's socket" });
  const bob = demo.getByRole("region", { name: "Bob's socket" });
  const carol = demo.getByRole("region", { name: "Carol's socket" });
  await expect(demo.locator("[data-client]")).toHaveCount(3);
  await expect(demo.locator("[data-track]")).toHaveCount(3);
  await expect(demo.locator("[data-packet]")).toHaveCount(3);

  await alice.getByRole("button", { name: "Vote Moon" }).click();
  await expect(alice.locator("[data-private]")).toContainText(
    "last_vote: Moon",
  );
  await expect(bob.locator("[data-private]")).toContainText("last_vote: None");
  await expect(bob.locator("[data-receipt]")).toHaveText("Moon 1 / Mars 0");
  await expect(carol.locator("[data-private]")).toContainText(
    "last_vote: None",
  );
  await expect(carol.locator("[data-receipt]")).toHaveText("Moon 1 / Mars 0");

  await alice.getByRole("button", { name: "Disconnect Alice" }).click();
  await expect(alice.getByRole("button", { name: "Vote Moon" })).toBeDisabled();
  await expect(alice.locator("[data-private]")).toContainText("No model");
  await bob.getByRole("button", { name: "Vote Mars" }).click();
  await expect(demo.locator('[data-total="Moon"]')).toHaveText("1");
  await expect(demo.locator('[data-total="Mars"]')).toHaveText("1");
  await expect(alice.locator("[data-receipt]")).toHaveText(
    "Offline; no updates",
  );

  await bob.getByRole("button", { name: "Disconnect Bob" }).click();
  await carol.getByRole("button", { name: "Vote Mars" }).click();
  await expect(carol.locator("[data-private]")).toContainText(
    "last_vote: Mars",
  );
  await expect(carol.locator("[data-receipt]")).toHaveText("Moon 1 / Mars 2");
  await expect(demo.getByRole("status")).toContainText("Carol voted for Mars.");
  await carol.getByRole("button", { name: "Disconnect Carol" }).click();
  await expect(carol.getByRole("button", { name: "Vote Mars" })).toBeDisabled();
  await expect(carol.locator("[data-private]")).toContainText("No model");
  await expect(demo.locator('[data-track="carol"]')).toHaveAttribute(
    "data-connected",
    "false",
  );
  await expect(demo.locator('[data-total="Moon"]')).toHaveText("1");
  await expect(demo.locator('[data-total="Mars"]')).toHaveText("2");
  await alice.getByRole("button", { name: "Reconnect Alice" }).click();
  await expect(alice.locator("[data-private]")).toContainText(
    "last_vote: None",
  );
  await expect(alice.locator("[data-receipt]")).toHaveText("Moon 1 / Mars 2");
  await alice.getByRole("button", { name: "Vote Moon" }).click();
  await expect(demo.locator('[data-total="Moon"]')).toHaveText("2");
  await expect(carol.locator("[data-receipt]")).toHaveText(
    "Offline; no updates",
  );
  await carol.getByRole("button", { name: "Reconnect Carol" }).click();
  await expect(carol.locator("[data-private]")).toContainText(
    "last_vote: None",
  );
  await expect(carol.locator("[data-receipt]")).toHaveText("Moon 2 / Mars 2");
  await expect(carol.getByRole("button", { name: "Vote Mars" })).toBeEnabled();
  await expect(demo.locator('[data-track="carol"]')).toHaveAttribute(
    "data-connected",
    "true",
  );
  await carol.getByRole("button", { name: "Disconnect Carol" }).click();

  await demo.getByRole("button", { name: "Reset poll" }).click();
  await expect(demo.locator('[data-total="Moon"]')).toHaveText("0");
  await expect(demo.locator('[data-total="Mars"]')).toHaveText("0");
  await expect(bob.getByRole("button", { name: "Vote Mars" })).toBeEnabled();
  await expect(carol.getByRole("button", { name: "Vote Mars" })).toBeEnabled();
  await expect(carol.locator("[data-private]")).toContainText(
    "last_vote: None",
  );
  await expect(carol.locator("[data-receipt]")).toHaveText("Moon 0 / Mars 0");
});

test("poll supports keyboard use and reduced motion without overflow", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(article);
  const poll = page.locator("shared-poll-demo");
  const carol = poll.getByRole("region", { name: "Carol's socket" });
  await carol.getByRole("button", { name: "Vote Moon" }).focus();
  await page.keyboard.press("Enter");
  await expect(poll.locator('[data-total="Moon"]')).toHaveText("1");
  for (const theme of ["light", "dark"]) {
    await page.evaluate((value) => {
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(value);
    }, theme);
    expect(
      await poll.evaluate(
        (element) => element.scrollWidth <= element.clientWidth,
      ),
    ).toBe(true);
    expect(
      await poll.evaluate(
        (element) =>
          element
            .getAnimations({ subtree: true })
            .filter(
              (animation) => Number(animation.effect?.getTiming().duration) > 1,
            ).length,
      ),
    ).toBe(0);
  }
});

test("without JavaScript the poll retains its explanation and disabled controls", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`http://localhost:4327${article}`);
  await expect(page.locator("shared-poll-demo noscript p")).toContainText(
    "keeps its totals",
  );
  await expect(
    page.getByRole("button", { name: "Vote Moon" }).first(),
  ).toBeDisabled();
  await expect(page.locator("shared-poll-demo [data-client]")).toHaveCount(3);
  await expect(
    page
      .getByRole("region", { name: "Carol's socket" })
      .getByRole("button", { name: "Vote Moon" }),
  ).toBeDisabled();
  await context.close();
});

test("homepage and feeds offer links instead of leaking component imports", async ({
  request,
}) => {
  const homepage = await request.get("/");
  const html = await homepage.text();
  expect(html).not.toContain("import SocketLoopDemo");
  expect(html).not.toContain("import SharedPollDemo");
  expect(html).not.toContain(`${article}#socket-update-demo`);
  expect(html).toContain(`${article}#shared-poll-demo`);

  const response = await request.get("/feed.json");
  const feed = await response.json();
  let content = "";
  for (const item of feed.items) {
    if (item.url.endsWith(article)) content = item.content_html;
  }
  expect(content).not.toContain(`${article}#socket-update-demo`);
  expect(content).toContain(`${article}#shared-poll-demo`);
  expect(content).not.toContain("customElements.define");
});
