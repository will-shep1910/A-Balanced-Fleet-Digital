import { ABFDigActor } from "./documents/actor.js";
import { ABFDigItem } from "./documents/item.js";
import { ABFDigActorSheet } from "./sheets/actor-sheet.js";
import { ABFDigItemSheet } from "./sheets/item-sheet.js";

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
