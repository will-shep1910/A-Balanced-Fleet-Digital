export class ABFDigActor extends Actor {
  /** @override */
  prepareData() {
    super.prepareData();

    const system = this.system;

    // Clamp health values (if attribute exists)
    if (system.attributes?.health) {
      system.attributes.health.value = Math.clamp(
        system.attributes.health.value,
        system.attributes.health.min,
        system.attributes.health.max
      );
    }

    // Aggregate ammo values from items
    this._prepareAmmo();
  }

  /**
   * Calculate and store aggregated ammo values from items.
   */
  _prepareAmmo() {
    const items = this.items;
    const ammoCounts = {
      atkammo: 0,
      defammo: 0,
      ciwsammo: 0
    };

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

    // Store in actor system for display or logic
    this.system.ammoCounts = ammoCounts;
  }
}
