import { RadarSystem } from "../radar.js";
import { MissileSystem } from "../missileAtk.js"; // make sure this exists

export class ABFDigActorSheet extends ActorSheet {
  get template() {
    return `systems/abf-dig/templates/actor/actor-sheet.hbs`;
  }

  getData() {
    // super.getData() returns { actor, data, items, effects, ... }
    const baseData = super.getData();

    const ammoCounts = { atkammo: 0, defammo: 0, ciwsammo: 0 };
    for (const item of this.actor.items) {
      if (item.type === "missileAtk") ammoCounts.atkammo += item.system?.atkammo?.value ?? 0;
      if (item.type === "missileDef") ammoCounts.defammo += item.system?.defammo?.value ?? 0;
      if (item.type === "ciws") ammoCounts.ciwsammo += item.system?.ciwsammo?.value ?? 0;
    }

    return {
      ...baseData,
      system: this.actor.system,   // 👈 expose system at root for HBS
      ammoCounts
    };
  }

  /** Helper method for choosing a target actor */
  async chooseTargetDialog() {
    const options = game.actors.contents
      .filter(a => a.type === "redShip" || a.type === "blueShip")
      .map(a => `<option value="${a.id}">${a.name}</option>`).join("");

    return new Promise(resolve => {
      new Dialog({
        title: "Select Target",
        content: `<select id="target">${options}</select>`,
        buttons: {
          ok: {
            label: "Select",
            callback: html => {
              const id = html.find("#target").val();
              resolve(game.actors.get(id));
            }
          },
          cancel: { label: "Cancel", callback: () => resolve(null) }
        },
        default: "ok"
      }).render(true);
    });
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Ammo input listeners
    html.find(".ammo-input").change(async (event) => {
      const input = event.currentTarget;
      const itemId = input.dataset.itemId;
      const ammoType = input.dataset.ammoType;
      const value = Math.max(0, Number(input.value) || 0);
      const item = this.actor.items.get(itemId);
      if (!item) return;
      await item.update({ [`system.${ammoType}.value`]: value });
      this.render();
    });

    // Radar toggle listener
    html.find(".radar-toggle").click(async (event) => {
      const actor = this.actor;
      const radarItem = actor.items.find(i => i.type === "radar");
      if (!radarItem) return;

      const newActive = !radarItem.system.active;
      await radarItem.update({ "system.active": newActive });

      if (game.user.isGM) {
        await RadarSystem.updateRadarVisibility(actor, radarItem);
      }

      event.currentTarget.textContent = newActive ? "Deactivate Radar" : "Activate Radar";
    });

    // Radar range input listener
    html.find(".radar-range").change(async (event) => {
      const input = event.currentTarget;
      const radarItem = this.actor.items.find(i => i.type === "radar");
      if (!radarItem) return;
      const rangeType = input.dataset.rangeType;
      const value = Math.max(0, Number(input.value) || 0);
      await radarItem.update({ [`system.${rangeType}`]: value });
    });

    // Health input listener
    html.find("#health-value").change(async (event) => {
      const value = Math.clamp(
        Number(event.currentTarget.value) || 0,
        this.actor.system.attributes.health.min,
        this.actor.system.attributes.health.max
      );

      await this.actor.update({ "system.attributes.health.value": value });

      // 🚨 Ship destroyed check
      if (value <= 0) {
        ChatMessage.create({
          speaker: { alias: this.actor.name },
          content: `<strong>${this.actor.name} has been destroyed!</strong> 💥`
        });
      }

      this.render();
    });

    // Item deletion
    html.find('.item-delete').click(async (event) => {
      event.preventDefault();
      const itemId = event.currentTarget.dataset.itemId;
      await this.actor.deleteEmbeddedDocuments("Item", [itemId]);
      this.render();
    });

    // Launch missile button (GM only)
    if (game.user.isGM) {
      html.find(".launch-missile").click(async ev => {
        ev.preventDefault();
        const target = await this.chooseTargetDialog();
        if (target) {
          MissileSystem.launchAttack(this.actor, target);
        }
      });
    }
  }
}
