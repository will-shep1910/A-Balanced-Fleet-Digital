export class ABFDigActor extends Actor {
  /** @override */
  prepareData() {
    super.prepareData();
    const system = this.system;

    // Clamp health if exists
    if (system.attributes?.health) {
      system.attributes.health.value = Math.clamp(
        Number(system.attributes.health.value ?? 0),
        system.attributes.health.min ?? 0,
        system.attributes.health.max ?? 0
      );
    }

    // Aggregate ammo counts
    this._prepareAmmo();
  }

  _prepareAmmo() {
    const items = this.items;
    const ammoCounts = { atkammo: 0, defammo: 0, ciwsammo: 0 };

    for (const item of items) {
      switch (item.type) {
        case "missileAtk":
          ammoCounts.atkammo += Number(item.system.atkammo?.value ?? 0);
          break;
        case "missileDef":
          ammoCounts.defammo += Number(item.system.defammo?.value ?? 0);
          break;
        case "ciws":
          ammoCounts.ciwsammo += Number(item.system.ciwsammo?.value ?? 0);
          break;
      }
    }

    this.system.ammoCounts = ammoCounts;
  }
}
