export class ABFDigActorSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["abf-dig", "sheet", "actor"],
      template: "systems/abf-dig/templates/actor/actor-sheet.hbs",
      width: 600,
      height: "auto",
    });
  }

  getData() {
    const context = super.getData();
    const actor = this.actor;

    const ammoCounts = {
      atkammo: 0,
      defammo: 0,
      ciwsammo: 0,
    };

    for (const item of actor.items) {
      const sys = item.system;
      if (item.type === "missileAtk") {
        ammoCounts.atkammo += Number(sys.atkammo?.value ?? 0);
      }
      if (item.type === "missileDef") {
        ammoCounts.defammo += Number(sys.defammo?.value ?? 0);
      }
      if (item.type === "ciws") {
        ammoCounts.ciwsammo += Number(sys.ciwsammo?.value ?? 0);
      }
    }

    context.ammoCounts = ammoCounts;
    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find(".ammo-input").change(async (event) => {
      const input = event.currentTarget;
      const itemId = input.dataset.itemId;
      const ammoType = input.dataset.ammoType;
      const newValue = Number(input.value);

      const item = this.actor.items.get(itemId);
      if (!item) return;

      const ammoData = item.system[ammoType];
      if (!ammoData) return;

      const clampedValue = Math.clamp(newValue, 0, Number(ammoData.max));
      await item.update({ [`system.${ammoType}.value`]: clampedValue });
    });

    html.find("#health-value").change(async (event) => {
      const input = event.currentTarget;
      const newValue = Math.clamp(
        Number(input.value),
        Number(this.actor.system.attributes.health.min),
        Number(this.actor.system.attributes.health.max)
      );
      await this.actor.update({ "system.attributes.health.value": newValue });
    });
  }
}
