export class MissileSystem {
  // 🔹 Track in-flight missiles by defender actor ID
  static _inFlight = {};

  static getInFlightCount(actorId) {
    return this._inFlight[actorId] ?? 0;
  }

  static async launchAttack(attackerActor, targetActor) {
    if (!attackerActor || !targetActor) return;

    const attackItem = attackerActor.items.find(i => i.type === "missileAtk");
    if (!attackItem) return ui.notifications.error("Attacker has no missile attack item.");

    const availableAmmo = attackItem.system.atkammo.value ?? 0;
    if (availableAmmo <= 0) return ui.notifications.error("No missile ammo available.");

    // GM chooses number of missiles to fire
    const missilesToFire = await new Promise(resolve => {
      new Dialog({
        title: "Missile Attack",
        content: `<p>Available ammo: ${availableAmmo}. How many missiles to fire?</p>
                  <input id="attack-count" type="number" min="1" max="${availableAmmo}" value="1">`,
        buttons: {
          fire: {
            label: "Fire",
            callback: html => resolve(Number(html.find("#attack-count").val()))
          },
          cancel: { label: "Cancel", callback: () => resolve(0) }
        },
        default: "fire"
      }).render(true);
    });

    if (missilesToFire <= 0) return;

    // Deduct attacking ammo
    await attackItem.update({ "system.atkammo.value": availableAmmo - missilesToFire });

    let remainingMissiles = missilesToFire;
    ui.notifications.info(`${attackerActor.name} launches ${missilesToFire} missiles!`);
    ui.notifications.info(`${remainingMissiles} missiles inbound on ${targetActor.name}.`);

    // 🔹 Add to in-flight count for target
    this._inFlight[targetActor.id] = (this._inFlight[targetActor.id] ?? 0) + remainingMissiles;

    const stageThresholds = [9, 3, 2, 2, 2, 2];

    // Defense loop
    for (let stage = 0; stage < stageThresholds.length; stage++) {
      if (remainingMissiles <= 0) break;

      const defenseItem = targetActor.items.find(i => i.type === "missileDef");
      if (!defenseItem || (defenseItem.system.defammo.value ?? 0) <= 0) break;

      const maxDef = Math.min(4, defenseItem.system.defammo.value);
      const defenseCount = await new Promise(resolve => {
        new Dialog({
          title: `Defense Stage ${stage + 1}`,
          content: `<p>Target has ${defenseItem.system.defammo.value} defense ammo. How many to fire this stage? (Max 4)</p>
                    <input id="def-count" type="number" min="1" max="${maxDef}" value="1">`,
          buttons: {
            fire: {
              label: "Fire Defense",
              callback: html => resolve(Number(html.find("#def-count").val()))
            },
            skip: { label: "Skip", callback: () => resolve(0) }
          },
          default: "fire"
        }).render(true);
      });

      if (defenseCount <= 0) continue;

      await defenseItem.update({ "system.defammo.value": defenseItem.system.defammo.value - defenseCount });

      let destroyed = 0;
      let rollResults = [];
      const threshold = stageThresholds[stage];

      for (let i = 0; i < defenseCount; i++) {
        const roll = await new Roll("1d10").roll({async: true});
        rollResults.push(roll.total);
        if (roll.total >= threshold) destroyed++;
      }

      // Update remaining missiles
      remainingMissiles -= destroyed;
      if (remainingMissiles < 0) remainingMissiles = 0;

      // Send defense stage results to chat
      ChatMessage.create({
      speaker: { alias: targetActor.name },
      content: `
        <div>
            <strong>${targetActor.name}</strong> defends at Stage ${stage + 1}<br>
            Required roll: <strong>${threshold}+</strong><br>
            Defense rolls: [${rollResults.join(", ")}]<br>
            Successes (missiles destroyed): <strong>${destroyed}</strong><br>
            Missiles remaining: <strong>${remainingMissiles}</strong>
        </div>
      `
    });


      // 🔹 Update in-flight after destruction
      this._inFlight[targetActor.id] = Math.max(0, this._inFlight[targetActor.id] - destroyed);

      if (remainingMissiles <= 0) break;
    }

    // Apply damage
    if (remainingMissiles > 0) {
        const targetHealth = targetActor.system.attributes.health;
        if (targetHealth) {
            const newHealth = Math.max(0, targetHealth.value - 1);
            await targetActor.update({ "system.attributes.health.value": newHealth });
            ui.notifications.info(`${targetActor.name} took 1 damage! Health now ${newHealth}/${targetHealth.max}`);

            if (newHealth <= 0) {
                ui.notifications.warn(`${targetActor.name} has been destroyed!`);
            }
        }
    } else {
        ui.notifications.info(`${targetActor.name} successfully defended all missiles.`);
    }
  }
}
