export class ABFDigItemSheet extends ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["abf-dig", "sheet", "item"],
      template: "systems/abf-dig/templates/item/item-sheet.hbs",
      width: 400,
      height: 360,
      resizable: true
    });
  }

  getData() {
    const context = super.getData();
    context.item = this.item;
    context.system = this.item.system;
    return context;
  }


  activateListeners(html) {
    super.activateListeners(html);

    html.find(".radar-input").on("change", ev => {
      const field = ev.currentTarget.name;
      const value = Number(ev.currentTarget.value) || 0;
      this.item.update({ [`system.${field}`]: value });
    });
  }
}

