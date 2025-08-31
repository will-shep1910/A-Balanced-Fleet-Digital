import { ABFDigActor } from "./documents/actor.js";
import { ABFDigItem } from "./documents/item.js";
import { ABFDigActorSheet } from "./sheets/actor-sheet.js";
import { ABFDigItemSheet } from "./sheets/item-sheet.js";
import { RadarSystem } from "./radar.js";

Hooks.once("init", async function () {
  console.log("abf-dig | Initializing ABF Digital system");

  game.abfDig = {
    ABFDigActor,
    ABFDigItem
  };

  CONFIG.Actor.documentClass = ABFDigActor;
  CONFIG.Item.documentClass = ABFDigItem;

  Actors.unregisterSheet("core", ActorSheet);
  Items.unregisterSheet("core", ItemSheet);

  Actors.registerSheet("abf-dig", ABFDigActorSheet, {
    types: ["redShip", "blueShip", "character"],
    makeDefault: true,
    });
  Items.registerSheet("abf-dig", ABFDigItemSheet, { makeDefault: true });

  // Handlebars helper for equality check
  Handlebars.registerHelper("eq", (a, b) => a === b);
});

// --- Radar auto-scan loop ---
Hooks.once("ready", () => {
  RadarSystem.startAutoScan();
});

Hooks.once("init", async function () {
  console.log("abf-dig | Initializing ABF Digital system");

  game.socket.on("system.abf-dig", async (data) => {
    if (!game.user.isGM) return;

    if (data.type === "toggleRadar") {
      const actor = game.actors.get(data.actorId);
      if (!actor) return;

      const radar = actor.items.find(i => i.type === "radar");
      if (!radar) return;

      await radar.update({ "system.active": data.radarActive });

      // Update visibility of all tokens based on radar
      import("./radar.js").then(mod => mod.RadarSystem(actor));
    }
  });
});