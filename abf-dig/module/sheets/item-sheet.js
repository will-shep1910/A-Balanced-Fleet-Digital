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

  getData(options) {
    return super.getData(options);
  }
}
