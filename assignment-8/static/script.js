"use strict";

const buttonAddEntryElements = document.getElementsByClassName("button-add-entry");
const buttonModifyEntryElements = document.getElementsByClassName("button-modify-entry");
const buttonDeleteEntryElements = document.getElementsByClassName("button-delete-entry");
const buttonSettingsElements = document.getElementsByClassName("button-settings");
const buttonLoginElements = document.getElementsByClassName("button-login");
const buttonLogoutElements = document.getElementsByClassName("button-logout");
const buttonCancelElements = document.getElementsByClassName("button-cancel");

const divMainExtraElement = document.getElementById("main-extra");
const divAddEntryElement = document.getElementById("add-entry");
const divModifyEntryElement = document.getElementById("modify-entry");
const divDeleteEntryElement = document.getElementById("delete-entry");
const divSettingsElement = document.getElementById("settings");
const divLoginElement = document.getElementById("login");
const divLogoutElement = document.getElementById("logout");
const divMainContentElement = document.getElementById("main-content");

const formAddEntryElement = document.getElementById("form-add-entry");
const formModifyEntryElement = document.getElementById("form-modify-entry");
const formDeleteEntryElement = document.getElementById("form-delete-entry");
const formSettingsElement = document.getElementById("form-settings");
const formLoginElement = document.getElementById("form-login");
const formLogoutElement = document.getElementById("form-logout");

const filterSearchElement = document.getElementById("filter-search");
const filterSortOrderElement = document.getElementById("filter-sort-order");
const filterCriteriaElement = document.getElementById("filter-criteria");


/* Session API:
 *   POST /login:
 *     body:     json[dict[str, str]]
 *     response: json[int] | json[None]
 *   POST /logout:
 *     body:     Any
 *     response: json[int] | json[None]
 */


/* REST API:
 *   GET    ~> get_user_addresses
 *   POST   ~> insert_address
 *   PUT    ~> update_address
 *   DELETE ~> delete_address
 *
 *   GET /addresses:
 *     body:     N/A
 *     response: json[list[dict[str, str | int | None]]] | json[None]
 *   POST /addresses:
 *     body:     json[dict[str, str | None]]
 *     response: json[int] | json[None]
 *   PUT /addresses/<addressid>:
 *     body:     json[dict[str, str | None]]
 *     response: json[int] | json[None]
 *   DELETE /addresses/<addressid>:
 *     body:     Any
 *     response: json[int] | json[None]
 */


/* POST /login:
 *   body:     json[dict[str, str | None]]
 *   response: json[int] | json[None]
 */
async function sessionLogin(username, password) {
  const response = await fetch(
    "/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "username": username,
        "password": password,
      }),
    },
  );
  return response.json();
}


/* POST /logout:
 *   body:     Any
 *   response: json[int] | json[None]
 */
async function sessionLogout() {
  const response = await fetch(
    "/logout",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(null),
    },
  );
  return response.json();
}


/* GET /addresses:
 *   body:     N/A
 *   response: json[list[dict[str, str | int | None]]] | json[None]
 */
async function getUserAddresses() {
  const response = await fetch(
    "/addresses",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  return response.json();
}


/* POST /addresses:
 *   body:     json[dict[str, str | None]]
 *   response: json[int] | json[None]
 */
async function insertAddress(name, email = null, tel = null) {
  const response = await fetch(
    "/addresses",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "name": name,
        "email": email,
        "tel": tel,
      }),
    },
  );
  return response.json();
}


/* PUT /addresses/<addressid>:
 *   body:     json[dict[str, str | None]]
 *   response: json[int] | json[None]
 */
async function updateAddress(addressid, name, email = null, tel = null) {
  const response = await fetch(
    `/addresses/${addressid}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "name": name,
        "email": email,
        "tel": tel,
      }),
    },
  );
  return response.json();
}


/* DELETE /addresses/<addressid>:
 *   body:     Any
 *   response: json[int] | json[None]
 */
async function deleteAddress(addressid) {
  const response = await fetch(
    `/addresses/${addressid}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(null),
    },
  );
  return response.json();
}


function formValidation(formData) {
  const dataObject = Object.fromEntries(formData);
  const name_ = dataObject["name"];
  const telephone = dataObject["telephone"];
  const email = dataObject["email"];

  // "The name field must never be empty"
  if (name_ === "") {
    return false;
  }

  // "Tel may contain only numbers and + - ( ) and space"
  const telephoneFilter = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
                           "+", "-", "(", ")", " "]
  for (const a of telephone) {
    let match = false;
    for (const b of telephoneFilter) {
      if (a.includes(b)) {
        match = true;
      }
    }
    if (!match) {
      return false;
    }
  }

  // "Email has to be a valid email"
  // Source: https://www.abstractapi.com/tools/email-regex-guide
  const emailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  if (!email.match(emailRegex)) {
    return false;
  }

  // "Either tel or email has to be filled in"
  // !(telephone || email) <=> (!telephone && !email)
  if (telephone === "" && email == "") {
    return false;
  }

  return true;
}


// TODO: (Optional)
class Settings {
  constructor() {
    this.font = "";
    this.size_ = "";
    this.color = "";
  }

  // Example: console.log(this.toHumanReadable());
  toHumanReadable() {
    return `[Settings] ` +
           `font: "${this.font}", ` +
           `size: "${this.size_}", ` +
           `color: "${this.color}"`;
  }
}


class Login {
  constructor() {
    this.username = null;
    this.password = null;
  }

  // Example: console.log(this.toHumanReadable());
  toHumanReadable() {
    return `[Login] ` +
           `username: "${this.username}", ` +
           `password: "${this.password}"`;
  }
}


class AddressEntry {
  constructor(
      addressId,
      addressName,
      addressEmail,
      addressTel,
      buttonModify,
      buttonDelete,
  ) {
    this.hidden = true;

    this.addressId = addressId;

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

    this.buttonModify = buttonModify;
    this.buttonDelete = buttonDelete;

    this.rebuild(addressName, addressEmail, addressTel);
  }

  // Example: console.log(this.toHumanReadable());
  toHumanReadable() {
    return `[AddressEntry] ` +
           `name: "${this.name_}", ` +
           `telephone: "${this.telephone}", ` +
           `email: "${this.email}"`;
  }

  rebuild(addressName, addressEmail, addressTel) {
    this.name_ = addressName;
    this.telephone = addressTel;
    this.email = addressEmail;

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

  isVisible() {
    return !this.hidden;
  }

  filterCompare(filterSearch, filterCriteria) {
    const searchLC = filterSearch.toLowerCase();
    const nameLC = this.name_.toLowerCase();
    const telephoneLC = this.telephone.toLowerCase();
    const emailLC = this.email.toLowerCase();

    if (filterSearch === "") {
      this.hidden = false;
      return;
    }
    switch (filterCriteria) {
      case "name":
        if (nameLC.includes(searchLC)) {
          this.hidden = false;
          return;
        }
        this.hidden = true;
        return;
      case "telephone":
        if (telephoneLC.includes(searchLC)) {
          this.hidden = false;
          return;
        }
        this.hidden = true;
        return;
      case "email":
        if (emailLC.includes(searchLC)) {
          this.hidden = false;
          return;
        }
        this.hidden = true;
        return;
    }
  }
}


class FilterHandler {
  constructor(parent) {
    // parent is necessary for this.parent.filterEntries().
    // parent is necessary for this.parent.sortEntries().
    // See implementation of handleEvent(event).
    this.parent = parent;

    this.search_ = filterSearchElement.value;
    this.sortOrder = filterSortOrderElement.checked;
    this.criteria = filterCriteriaElement.value;

    filterSearchElement.addEventListener("input", this);
    filterSortOrderElement.addEventListener("input", this);
    filterCriteriaElement.addEventListener("input", this);
  }

  // Example: console.log(this.toHumanReadable());
  toHumanReadable() {
    return `[FilterHandler] ` +
           `search: "${this.search_}", ` +
           `sortOrder: "${this.sortOrder}", ` +
           `criteria: "${this.criteria}"`;
  }

  getSearch() {
    return this.search_;
  }

  getSortOrder() {
    return this.sortOrder;
  }

  getCriteria() {
    return this.criteria;
  }

  handleEvent(event) {
    if (event.target === filterSearchElement) {
      if (event.type === "input") {
        this.search_ = event.target.value;
        this.parent.filterEntries();
      }
    }
    if (event.target === filterSortOrderElement) {
      if (event.type === "input") {
        this.sortOrder = event.target.checked;
        this.parent.sortEntries();
      }
    }
    if (event.target === filterCriteriaElement) {
      if (event.type === "input") {
        this.criteria = event.target.value;
        this.parent.sortEntries();
      }
    }
  }
}


class AddEntryHandler {
  constructor(parent) {
    // parent is necessary for this.parent.addEntry(formData).
    // See implementation of handleEvent(event).
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
        if (formValidation(formData)) {
          this.parent.addEntry(formData);
          this.div.style.display = "none";
        } else {
          // TODO: Message about invalid formData.
          console.log("TODO: Message about invalid formData.");
        }
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
    // parent is necessary for this.parent.modifyEntry(this.owner, formData).
    // parent is necessary for access to this.parent.stuff.
    // See implementation of handleEvent(event).
    this.parent = parent;

    // The active owner (AddressEntry) of the modify-entry box.
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
        if (formValidation(formData)) {
          if (this.owner !== null) {
            this.parent.modifyEntry(this.owner, formData);
          }
          this.owner = null;
          this.div.style.display = "none";
        } else {
          // TODO: Message about invalid formData.
          console.log("TODO: Message about invalid formData.");
        }
      }
    }
    for (const element of this.buttonStart) {
      if (event.target === element) {
        if (event.type === "click") {
          // Find the new owner of the modify-entry box and display the box.
          for (const addressEntry of this.parent.stuff) {
            if (addressEntry.div === event.target.parentElement) {
              this.owner = addressEntry;
              this.form.name.value = addressEntry.name_;
              this.form.telephone.value = addressEntry.telephone;
              this.form.email.value = addressEntry.email;
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
    // parent is necessary for this.parent.deleteEntry(this.owner).
    // parent is necessary for access to this.parent.stuff.
    // See implementation of handleEvent(event).
    this.parent = parent;

    // The active owner (AddressEntry) of the delete-entry box.
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
          // Find the new owner of the delete-entry box and display the box.
          for (const addressEntry of this.parent.stuff) {
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


// TODO: (Optional)
class SettingsHandler {
  constructor(parent) {
    // See implementation of handleEvent(event).
    this.parent = parent;

    this.settings = new Settings();

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
        const formData = new FormData(this.form);
        const dataObject = Object.fromEntries(formData);
        // TODO: (Optional)
        console.log(this.settings.toHumanReadable());
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


class LoginHandler {
  constructor(parent) {
    // See implementation of handleEvent(event).
    this.parent = parent;

    this.login = new Login();

    this.div = divLoginElement;
    this.form = formLoginElement;
    this.buttonStart = [];
    for (const element of buttonLoginElements) {
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
        const dataObject = Object.fromEntries(formData);
        this.login.username = dataObject["username"];
        this.login.password = dataObject["password"];
        console.log(this.login.toHumanReadable()); // TODO: Delete.
        this.parent.login().then((success) => {
          if (success) {
            this.div.style.display = "none";
          } else {
            // TODO: Message about login failure.
            console.log("TODO: Message about login failure.");
          }
        });
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


class LogoutHandler {
  constructor(parent) {
    // See implementation of handleEvent(event).
    this.parent = parent;

    this.div = divLogoutElement;
    this.form = formLogoutElement;
    this.buttonStart = [];
    for (const element of buttonLogoutElements) {
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
        this.parent.logout().then((success) => {
          if (success) {
            this.div.style.display = "none";
          } else {
            // TODO: Message about logout failure.
            console.log("TODO: Message about logout failure.");
          }
        });
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
    this.loginHandler = new LoginHandler(this);
    this.logoutHandler = new LogoutHandler(this);

    this.div = divMainContentElement;

    this.stuff = []; // Address entries.
  }

  // Example: console.log(this.toHumanReadable());
  toHumanReadable() {
    const humanReadableStuff = [];
    for (const addressEntry of this.stuff) {
      humanReadableStuff.push(addressEntry.toHumanReadable());
    }
    return humanReadableStuff.join("\n");
  }

  async login() {
    const username = this.loginHandler.login.username;
    const password = this.loginHandler.login.password;
    const userid = await sessionLogin(username, password);
    console.log(`login userid: ${userid}`); // TODO: Delete.
    this.reloadEntries();
    if (userid !== null) {
      return true;
    }
    return false;
  }

  async logout() {
    const userid = await sessionLogout();
    console.log(`logout userid: ${userid}`); // TODO: Delete.
    this.reloadEntries();
    if (userid !== null) {
      return true;
    }
    return false;
  }

  // NOTE: This function is not being used.
  getLastEntry() {
    if (Array.isArray(this.stuff) && this.stuff.length > 0) {
      const lastIndex = this.stuff.length - 1;
      return this.stuff[lastIndex];
    }
    return null;
  }

  reloadEntries() {
    console.log("reload entries"); // TODO: Delete.
    while (this.stuff.length) {
      this.stuff.pop();
    }
    getUserAddresses().then((addresses) => {
      if (addresses !== null) {
        for (const address of addresses) {
          const addressId = address["id"];
          const addressName = address["name"];
          const addressEmail = address["email"];
          const addressTel = address["tel"];
          const buttonModify = this.modifyEntryHandler.newButton();
          const buttonDelete = this.deleteEntryHandler.newButton();
          const addressEntry = new AddressEntry(
            addressId,
            addressName,
            addressEmail,
            addressTel,
            buttonModify,
            buttonDelete,
          );
          console.log(addressEntry.toHumanReadable()); // TODO: Delete.
          this.stuff.push(addressEntry);
        }
      }
      this.sortEntries();
    });
  }

  addEntry(formData) {
    const dataObject = Object.fromEntries(formData);
    const formName = dataObject["name"];
    const formEmail = dataObject["email"];
    const formTel = dataObject["telephone"];

    insertAddress(formName, formEmail, formTel).then((addressid) => {
      if (addressid !== null) {
        this.reloadEntries();
      }
    });
  }

  modifyEntry(addressEntry, formData) {
    const dataObject = Object.fromEntries(formData);
    const formName = dataObject["name"];
    const formEmail = dataObject["email"];
    const formTel = dataObject["telephone"];

    updateAddress(
      addressEntry.addressId,
      formName,
      formEmail,
      formTel,
    ).then((response) => {
      if (response !== null) {
        this.reloadEntries();
      }
    });
  }

  deleteEntry(addressEntry) {
    deleteAddress(addressEntry.addressId).then((response) => {
      if (response !== null) {
        //this.reloadEntries();
        if (Array.isArray(this.stuff) && this.stuff.length > 0) {
          for (const [index, item] of this.stuff.entries()) {
            if (item === addressEntry) {
              this.stuff.splice(index, 1);
              break;
            }
          }
        }
        this.showEntries();
      }
    });
  }

  filterEntries() {
    console.log("filter entries"); // TODO: Delete.
    const filterSearch = this.filterHandler.getSearch();
    const filterCriteria = this.filterHandler.getCriteria();

    if (Array.isArray(this.stuff) && this.stuff.length > 0) {
      for (const addressEntry of this.stuff) {
        addressEntry.filterCompare(filterSearch, filterCriteria);
      }
    }
    this.showEntries();
  }

  sortEntries() {
    console.log("sort entries"); // TODO: Delete.
    const filterSortOrder = this.filterHandler.getSortOrder();
    const filterCriteria = this.filterHandler.getCriteria();

    function compareName(a, b) {
      return a.name_.localeCompare(b.name_);
    }
    function compareTelephone(a, b) {
      return a.telephone.localeCompare(b.telephone);
    }
    function compareEmail(a, b) {
      return a.email.localeCompare(b.email);
    }

    switch (filterCriteria) {
      case "name":
        this.stuff.sort(compareName);
        break;
      case "telephone":
        this.stuff.sort(compareTelephone);
        break;
      case "email":
        this.stuff.sort(compareEmail);
        break;
    }
    if (filterSortOrder === false) {
      this.stuff.reverse();
    }

    this.filterEntries();
  }

  showEntries() {
    console.log("show entries"); // TODO: Delete.
    while (this.div.firstChild) {
      this.div.removeChild(this.div.firstChild);
    }
    if (Array.isArray(this.stuff) && this.stuff.length > 0) {
      for (const addressEntry of this.stuff) {
        if (addressEntry.isVisible()) {
          this.div.appendChild(addressEntry.div);
        }
      }
    }
  }
}

const addressBook = new AddressBook();
addressBook.reloadEntries();

