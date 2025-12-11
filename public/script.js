import { sdk } from "https://esm.sh/@farcaster/miniapp-sdk";
import { initPassGenie } from "./PassGenie-ui.js";

window.addEventListener("load", async () => {
  let isMini = false;

  try {
    isMini = await sdk.isInMiniApp();
  } catch (err) {
    console.warn("PassGenie: sdk.isInMiniApp failed, assuming web environment", err);
    isMini = false;
  }

  initPassGenie({ isMini });

  try {
    await sdk.actions.ready();
  } catch (err) {
    console.warn("PassGenie: sdk.actions.ready failed (likely not in mini app)", err);
  }
});
