export class ABFDigItem extends Item {
  prepareData() {
    super.prepareData();

    const system = this.system;

    // Default values for each ammo type
    if (this.type === "missileAtk") {
      system.atkammo = system.atkammo || {};
      system.atkammo.max = system.atkammo.max ?? 4;
      system.atkammo.value = Math.clamp(Number(system.atkammo.value ?? 0), 0, system.atkammo.max);
    }

    if (this.type === "missileDef") {
      system.defammo = system.defammo || {};
      system.defammo.max = system.defammo.max ?? 4;
      system.defammo.value = Math.clamp(Number(system.defammo.value ?? 0), 0, system.defammo.max);
    }

    if (this.type === "ciws") {
      system.ciwsammo = system.ciwsammo || {};
      system.ciwsammo.max = system.ciwsammo.max ?? 6;
      system.ciwsammo.value = Math.clamp(Number(system.ciwsammo.value ?? 0), 0, system.ciwsammo.max);
    }
  }
}
