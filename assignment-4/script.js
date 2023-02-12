"use strict";

const buttonAddEntryElements = document.getElementsByClassName("button-add-entry");
const buttonModifyEntryElements = document.getElementsByClassName("button-modify-entry");
const buttonDeleteEntryElements = document.getElementsByClassName("button-delete-entry");
const buttonSettingsElements = document.getElementsByClassName("button-settings");
const buttonCancelElements = document.getElementsByClassName("button-cancel");

const divMainExtraElement = document.getElementById("main-extra");
const divAddEntryElement = document.getElementById("add-entry");
const divModifyEntryElement = document.getElementById("modify-entry");
const divDeleteEntryElement = document.getElementById("delete-entry");
const divSettingsElement = document.getElementById("settings");
const divMainContentElement = document.getElementById("main-content");

const formAddEntryElement = document.getElementById("form-add-entry");
const formModifyEntryElement = document.getElementById("form-modify-entry");
const formDeleteEntryElement = document.getElementById("form-delete-entry");
const formSettingsElement = document.getElementById("form-settings");

const filterSearchElement = document.getElementById("filter-search");
const filterCriteriaElement = document.getElementById("filter-criteria");


class Settings {
  constructor(parent) {
    this.parent = parent;

    this.font = "";
    this.size_ = "";
    this.color = "";
  }

  toHumanReadable() {
    return `[Settings] ` +
           `font: "${this.font}", ` +
           `size: "${this.size_}", ` +
           `color: "${this.color}"`;
  }
}


class AddressEntry {
  constructor(parent, formData) {
    this.parent = parent;

    this.div = document.createElement("div");
    this.div.setAttribute("class", "address-entry");

    this.nameElement = document.createElement("div");
    this.nameElement.setAttribute("class", "address-entry-name");

    this.telephoneElement = document.createElement("div");
    this.telephoneElement.setAttribute("class", "address-entry-telephone");

    this.emailElement = document.createElement("div");
    this.emailElement.setAttribute("class", "address-entry-email");
    this.emailMailtoElement = document.createElement("a");
    this.emailMailtoElement.setAttribute("class", "address-entry-email-mailto");
    this.emailElement.appendChild(this.emailMailtoElement);

    this.buttonModify = this.parent.modifyEntryHandler.newButton();
    this.buttonDelete = this.parent.deleteEntryHandler.newButton();

    this.rebuild(formData);
  }

  toHumanReadable() {
    return `[AddressEntry] ` +
           `name: "${this.name_}", ` +
           `telephone: "${this.telephone}", ` +
           `email: "${this.email}"`;
  }

  rebuild(formData) {
    const dataObject = Object.fromEntries(formData);
    this.name_ = dataObject["name"];
    this.telephone = dataObject["telephone"];
    this.email = dataObject["email"];

    this.nameElement.textContent = this.name_;
    this.telephoneElement.textContent = this.telephone;
    this.emailMailtoElement.textContent = this.email;
    this.emailMailtoElement.href = `mailto:${this.email}`;

    while (this.div.firstChild) {
      this.div.removeChild(this.div.firstChild);
    }
    this.div.appendChild(this.nameElement);
    this.div.appendChild(this.telephoneElement);
    this.div.appendChild(this.emailElement);
    this.div.appendChild(this.buttonModify);
    this.div.appendChild(this.buttonDelete);
  }

  // WIP
  filterCompare() {
    const filterSearch = this.parent.filterHandler.getSearch();
    const filterCriteria = this.parent.filterHandler.getCriteria();

    if (filterSearch === "") {
      return true;
    }
    switch (filterCriteria) {
      case "name":
        // TODO: Compare.
        if (false) {
          return true;
        }
      case "telephone":
        // TODO: Compare.
        if (false) {
          return true;
        }
      case "email":
        // TODO: Compare.
        if (false) {
          return true;
        }
    }
    return false;
  }
}


class FilterHandler {
  constructor(parent) {
    this.parent = parent;

    this.search_ = filterSearchElement.value;
    this.criteria = filterCriteriaElement.value;

    filterSearchElement.addEventListener("input", this);
    filterCriteriaElement.addEventListener("input", this);
  }

  toHumanReadable() {
    return `[FilterHandler] ` +
           `search: "${this.search_}", ` +
           `criteria: "${this.criteria}"`;
  }

  getSearch() {
    return this.search_;
  }

  getCriteria() {
    return this.criteria;
  }

  handleEvent(event) {
    if (event.target === filterSearchElement) {
      if (event.type === "input") {
        this.search_ = event.target.value;
        this.parent.show();
      }
    }
    if (event.target === filterCriteriaElement) {
      if (event.type === "input") {
        this.criteria = event.target.value;
        this.parent.show();
      }
    }
  }
}


class AddEntryHandler {
  constructor(parent) {
    this.parent = parent;

    this.div = divAddEntryElement;
    this.form = formAddEntryElement;
    this.buttonStart = [];
    for (const element of buttonAddEntryElements) {
        this.buttonStart.push(element);
    }
    this.buttonCancel = [];
    for (const element of buttonCancelElements) {
      if (element.parentElement === this.div) {
        this.buttonCancel.push(element);
      }
    }

    this.form.onsubmit = (event) => {return false;};
    this.form.addEventListener("submit", this);
    for (const element of this.buttonStart) {
      element.addEventListener("click", this);
    }
    for (const element of this.buttonCancel) {
      element.addEventListener("click", this);
    }
  }

  handleEvent(event) {
    if (event.target === this.form) {
      if (event.type === "submit") {
        const formData = new FormData(this.form);
        this.parent.addEntry(formData);
        this.div.style.display = "none";
      }
    }
    for (const element of this.buttonStart) {
      if (event.target === element) {
        if (event.type === "click") {
          this.div.style.display = "block";
        }
      }
    }
    for (const element of this.buttonCancel) {
      if (event.target === element) {
        if (event.type === "click") {
          this.div.style.display = "none";
        }
      }
    }
  }
}


class ModifyEntryHandler {
  constructor(parent) {
    this.parent = parent;

    this.owner = null;

    this.div = divModifyEntryElement;
    this.form = formModifyEntryElement;
    this.buttonStart = [];
    for (const element of buttonModifyEntryElements) {
        this.buttonStart.push(element);
    }
    this.buttonCancel = [];
    for (const element of buttonCancelElements) {
      if (element.parentElement === this.div) {
        this.buttonCancel.push(element);
      }
    }

    this.form.onsubmit = (event) => {return false;};
    this.form.addEventListener("submit", this);
    for (const element of this.buttonStart) {
      element.addEventListener("click", this);
    }
    for (const element of this.buttonCancel) {
      element.addEventListener("click", this);
    }
  }

  newButton() {
    const button = document.createElement("button");
    button.setAttribute("class", "button-modify-entry");
    button.textContent = "Modify entry";
    this.buttonStart.push(button);
    button.addEventListener("click", this);

    return button;
  }

  handleEvent(event) {
    if (event.target === this.form) {
      if (event.type === "submit") {
        const formData = new FormData(this.form);
        if (this.owner !== null) {
          this.parent.modifyEntry(this.owner, formData);
        }
        this.owner = null;
        this.div.style.display = "none";
      }
    }
    for (const element of this.buttonStart) {
      if (event.target === element) {
        if (event.type === "click") {
          for (const addressEntry of this.parent.unsortedStuff) {
            if (addressEntry.div === event.target.parentElement) {
              this.owner = addressEntry;
              this.div.style.display = "block";
              break;
            }
          }
        }
      }
    }
    for (const element of this.buttonCancel) {
      if (event.target === element) {
        if (event.type === "click") {
          this.owner = null;
          this.div.style.display = "none";
        }
      }
    }
  }
}


class DeleteEntryHandler {
  constructor(parent) {
    this.parent = parent;

    this.owner = null;

    this.div = divDeleteEntryElement;
    this.form = formDeleteEntryElement;
    this.buttonStart = [];
    for (const element of buttonDeleteEntryElements) {
        this.buttonStart.push(element);
    }
    this.buttonCancel = [];
    for (const element of buttonCancelElements) {
      if (element.parentElement === this.div) {
        this.buttonCancel.push(element);
      }
    }

    this.form.onsubmit = (event) => {return false;};
    this.form.addEventListener("submit", this);
    for (const element of this.buttonStart) {
      element.addEventListener("click", this);
    }
    for (const element of this.buttonCancel) {
      element.addEventListener("click", this);
    }
  }

  newButton() {
    const button = document.createElement("button");
    button.setAttribute("class", "button-delete-entry");
    button.textContent = "Delete entry";
    this.buttonStart.push(button);
    button.addEventListener("click", this);

    return button;
  }

  handleEvent(event) {
    if (event.target === this.form) {
      if (event.type === "submit") {
        if (this.owner !== null) {
          this.parent.deleteEntry(this.owner);
        }
        this.owner = null;
        this.div.style.display = "none";
      }
    }
    for (const element of this.buttonStart) {
      if (event.target === element) {
        if (event.type === "click") {
          for (const addressEntry of this.parent.unsortedStuff) {
            if (addressEntry.div === event.target.parentElement) {
              this.owner = addressEntry;
              this.div.style.display = "block";
              break;
            }
          }
        }
      }
    }
    for (const element of this.buttonCancel) {
      if (event.target === element) {
        if (event.type === "click") {
          this.owner = null;
          this.div.style.display = "none";
        }
      }
    }
  }
}


class SettingsHandler {
  constructor(parent) {
    this.parent = parent;

    this.settings = new Settings(this);

    this.div = divSettingsElement;
    this.form = formSettingsElement;
    this.buttonStart = [];
    for (const element of buttonSettingsElements) {
        this.buttonStart.push(element);
    }
    this.buttonCancel = [];
    for (const element of buttonCancelElements) {
      if (element.parentElement === this.div) {
        this.buttonCancel.push(element);
      }
    }

    this.form.onsubmit = (event) => {return false;};
    this.form.addEventListener("submit", this);
    for (const element of this.buttonStart) {
      element.addEventListener("click", this);
    }
    for (const element of this.buttonCancel) {
      element.addEventListener("click", this);
    }
  }

  handleEvent(event) {
    if (event.target === this.form) {
      if (event.type === "submit") {
        // TODO: (Optional)
        this.div.style.display = "none";
      }
    }
    for (const element of this.buttonStart) {
      if (event.target === element) {
        if (event.type === "click") {
          this.div.style.display = "block";
        }
      }
    }
    for (const element of this.buttonCancel) {
      if (event.target === element) {
        if (event.type === "click") {
          this.div.style.display = "none";
        }
      }
    }
  }
}


class AddressBook {
  constructor() {
    this.filterHandler = new FilterHandler(this);
    this.addEntryHandler = new AddEntryHandler(this);
    this.modifyEntryHandler = new ModifyEntryHandler(this);
    this.deleteEntryHandler = new DeleteEntryHandler(this);
    this.settingsHandler = new SettingsHandler(this);
    this.unsortedStuff = [];
    this.filteredStuff = [];
  }

  toHumanReadable() {
    const humanReadableStuff = [];
    for (const addressEntry of this.unsortedStuff) {
      humanReadableStuff.push(addressEntry.toHumanReadable());
    }

    return humanReadableStuff.join("\n");
  }

  // NOTE: This function is not being used.
  getLastEntry() {
    const lastIndex = this.unsortedStuff.length - 1;
    return this.unsortedStuff[lastIndex];
  }

  addEntry(formData) {
    const addressEntry = new AddressEntry(this, formData);
    this.unsortedStuff.push(addressEntry);
    this.show();
  }

  modifyEntry(addressEntry, formData) {
    addressEntry.rebuild(formData);
    this.show();
  }

  deleteEntry(addressEntry) {
    if (Array.isArray(this.unsortedStuff) && this.unsortedStuff.length > 0) {
      for (const [index, item] of this.unsortedStuff.entries()) {
        if (item === addressEntry) {
          this.unsortedStuff.splice(index, 1);
          break;
        }
      }
    }
    this.show();
  }

  // TODO: (Optional)
  sortEntries() {
  }

  show() {
    while (divMainContentElement.firstChild) {
      divMainContentElement.removeChild(divMainContentElement.firstChild);
    }
    if (Array.isArray(this.unsortedStuff) && this.unsortedStuff.length > 0) {
      for (const addressEntry of this.unsortedStuff) {
        if (addressEntry.filterCompare()) {
          divMainContentElement.appendChild(addressEntry.div);
        }
      }
    }
  }
}

const addressBook = new AddressBook();

// Some sample initial data.
let formData;

formData = new FormData();
formData.append("name", "name1");
formData.append("telephone", "12345678");
formData.append("email", "name1@test.com");
addressBook.addEntry(formData);

formData = new FormData();
formData.append("name", "name2");
formData.append("telephone", "12345678");
formData.append("email", "name2@test.com");
addressBook.addEntry(formData);

formData = new FormData();
formData.append("name", "name3");
formData.append("telephone", "12345678");
formData.append("email", "name3@test.com");
addressBook.addEntry(formData);

formData = new FormData();
formData.append("name", "name4");
formData.append("telephone", "12345678");
formData.append("email", "name4@test.com");
addressBook.addEntry(formData);

formData = new FormData();
formData.append("name", "name5");
formData.append("telephone", "12345678");
formData.append("email", "name5@test.com");
addressBook.addEntry(formData);

