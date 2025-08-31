# abf-dig (A Balanced Fleet – Digital)

abf-dig is a custom **Foundry VTT** game system for simulating modern naval battles based on the pre-existing wargaming ruleset from Dr Nick Bradbeer.  
It focuses on missile attacks, layered defense, radar tracking, and ship health management.

---

## 🚀 Features

### Actor Types
- **redShip** and **blueShip** represent opposing forces.

### Item Types
- **missileAtk** – Offensive missiles with configurable ammo and damage.  
- **missileDef** – Defensive missile systems with limited ammo.  
- **ciws** – Close-In Weapon Systems for point defense.  
- **radar** – Active and passive radar modes with toggleable detection ranges.  

### Combat System
- Missile attacks launched by actors.  
- Multi-stage defense rolls against incoming missiles.  
- Stage thresholds configurable in `missileAtk.js`.  
- Running missile count tracked through each stage.  
- **Damage equals the number of surviving missiles.**  
- Automatic health tracking per ship.  
- Ship destruction message when health reaches zero.  

### Interface
- Actor sheets show health and ammo counts.  
- Item sheets let you adjust ammo values.  
- GM-only **Launch Missile** button for attack resolution.  
- Defense rolls, results, and thresholds displayed in chat.  

---

## ⚙️ Installation

1. Copy the `abf-dig` system folder into your `FoundryVTT/Data/systems` directory.  
2. Restart Foundry VTT.  
3. Create a new world and select **abf-dig** as the game system.  

---

## 📖 Usage Notes

- Add **missileAtk**, **missileDef**, **ciws**, and **radar** items to ships to configure loadouts.  
- Health and ammo can be edited directly from actor and item sheets.  
- GM controls launching of missile attacks.  
- Damage is automatically applied; destroyed ships will trigger notifications.  

---

## 👤 Credits

Created by **Will Shepperson** for Foundry VTT.  
based on "A Balanced Fleet" by Dr Nick Bradbeer (see LICENSE.md for Creative Commons details)
Built using the Foundry VTT System Development framework.  
