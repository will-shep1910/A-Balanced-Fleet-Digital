export class RadarSystem {
  /** Update visibility of all tokens based on radar */
  static async updateRadarVisibility(actor, radarItem) {
    if (!actor || !radarItem) return;
    const scene = game.scenes.current;
    if (!scene) return;
    const radarToken = actor.getActiveTokens()[0];
    if (!radarToken) return;

    const range = radarItem.system.active
      ? radarItem.system.activeRange
      : radarItem.system.passiveRange;

    // Always show the radar owner's token if active
    if (radarItem.system.active && radarToken.hidden) {
      await radarToken.update({ hidden: false });
    }

    // Loop through all tokens on the canvas
    for (const tokenDoc of scene.tokens) {
      if (!tokenDoc) continue;
      if (tokenDoc.id === radarToken.id) continue; // skip radar owner

      const dx = tokenDoc.x - radarToken.x;
      const dy = tokenDoc.y - radarToken.y;
      const dist = Math.hypot(dx, dy) / canvas.grid.size;

      const shouldBeVisible = dist <= range;

      // Reveal tokens in range
      if (shouldBeVisible && tokenDoc.hidden) {
        await tokenDoc.update({ hidden: false });
      }
      // Hide tokens out of range
      else if (!shouldBeVisible && !tokenDoc.hidden) {
        await tokenDoc.update({ hidden: true });
      }
    }
  }

  /** Set up hooks and periodic scanning */
  static startAutoScan() {
    // Listen for radar activation toggles
    Hooks.on("updateItem", (item, changes) => {
      if (item.type === "radar" && "system.active" in changes) {
        const actor = item.actor;
        if (actor) RadarSystem.updateRadarVisibility(actor, item);
      }
    });

    // Periodic radar scan every 3 seconds
    setInterval(() => {
      for (const actor of game.actors.contents) {
        const radar = actor.items.find(i => i.type === "radar");
        if (radar) RadarSystem.updateRadarVisibility(actor, radar);
      }
    }, 3000);
  }
}

// Initialize auto scanning after canvas is ready
Hooks.once("canvasReady", () => {
  RadarSystem.startAutoScan();
});

// Hide ship tokens (Red/Blue) on creation
Hooks.on("createToken", async (tokenDocument) => {
  const actor = game.actors.get(tokenDocument.actorId);
  if (!actor) return;

  if (actor.type === "redShip" || actor.type === "blueShip") {
    // Only hide locally for each player; no GM update required
    const token = canvas.tokens.placeables.find(t => t.id === tokenDocument.id);
    if (token) token.visible = false;
  }
});
