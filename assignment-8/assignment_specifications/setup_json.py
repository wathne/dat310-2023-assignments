import json
from werkzeug.security import generate_password_hash, check_password_hash

USERS_FILE = r"./users.json"
CONTACTS_FILE = r"./contacts.json"

def create_file(filename):
    try:
        # create file
        with open(filename, 'x') as fp:
            pass
    except:
        print('{filename} already exists')

def init_files():
    create_file(USERS_FILE)
    create_file(CONTACTS_FILE)

#### INSERT #########

def add_user(username, pwhash):
    """
    Add a new user into the users table
    :param username:
    :param pwhash:
    """
    users = readJSONDict(USERS_FILE)
    if username in users:
        raise ValueError("username already in use")
    users[username] = pwhash
    writeJSON(USERS_FILE, users)

def add_contact(username, name, tel, email):
    """
    Add a new contact for user username
    :param username:
    :param name:
    :param tel:
    :param email:
    """
    contacts = readJSONDict(CONTACTS_FILE)
    usercontacts = contacts.get(username,[])
    id = 0
    # assume the last contact in the list has the highest id
    # oups id is not guaranteed to be unique
    if len(usercontacts) > 0:
        id = usercontacts[-1]["contact_id"]+1
    newcontact = {
        "contact_id": id,
        "name": name,
        "tel": tel,
        "email": email
    }
    usercontacts.append(newcontact)

    contacts[username] = usercontacts
    writeJSON(CONTACTS_FILE, contacts)
    return id

def update_contact(username, id, newname, newtel, newemail):
    """
    Update contact with contact_id for user username
    :param username:
    :param id:
    :param name:
    :param tel:
    :param email:
    """
    contacts = readJSONDict(CONTACTS_FILE)
    usercontacts = contacts.get(username,[])
    for contact in usercontacts:
        if contact["contact_id"] == id:
            contact["name"] = newname
            contact["tel"] = newtel
            contact["email"] = newemail
            contacts[username] = usercontacts
            writeJSON(CONTACTS_FILE, contacts)
            return 
    else:
        raise ValueError("user {} does not have contact with id {}".format(username, id))


#### SELECT #######

def get_pwhash(username):
    # return pw hash
    users = readJSONDict(USERS_FILE)
    return users.get(username, None)

def get_contacts(username):
    # return all contacts of one user
    contacts = readJSONDict(CONTACTS_FILE)
    return contacts.get(username, [])


    
#### JSON #######

def readJSONList(filename):
    jsonlist = []
    with open(filename, "r") as f:
        filecontent = f.read()
        #print("File contains: {}".format(filecontent))
        if filecontent == "":
            print("Empty file")
        else:
            jsonlist = json.loads(filecontent)
    return jsonlist

def readJSONDict(filename):
    jsondict = {}
    with open(filename, "r") as f:
        filecontent = f.read()
        #print("File contains: {}".format(filecontent))
        if filecontent == "":
            print("Empty file")
        else:
            jsondict = json.loads(filecontent)
    return jsondict

def writeJSON(filename, data):
    jsonstring = json.dumps(data)
    with open(filename, "w") as f:
        f.write(jsonstring)


#### SETUP ####

def setup():
    init_files()
    add_user("johndoe", generate_password_hash("Joe123"))
    add_user("maryjane", generate_password_hash("LoveDogs"))
    
    add_contact("johndoe", "Don John", "12-322-622", "don.john@ymail.com")
    add_contact("maryjane","Don John", "12-322-622", "don.john@ymail.com")
    add_contact("johndoe","Elizabeth Westland", "66-112-312", "e47wl@outlook.com")
    add_contact("maryjane","John Smith", "12-345-678", "john.smith@gmail.com")
    add_contact("maryjane","Kevin Magnussen", "+31 997-11-21", "kevinrulez@noemail.com")
        

def test():
    hash = get_pwhash("maryjane")
    print("Check password: {}".format(check_password_hash(hash,"LoveDogs")))

    print("Testing contact update:")
    update_contact("maryjane", 2, "Kevin Magnussen", "123-123-123", "kevinrulez@noemail.com")
    contacts = get_contacts("maryjane")
    if len(contacts) != 3:
        print("Error, expected maryjane to hace 3 contacts")
        if contacts[2]["tel"] != "123-123-123":
            print("Error, expected contact with updated tel")
    print("maryjane Contacts are:")
    print(contacts)

    

if __name__ == '__main__':
    # If executed as main, this will create tables and insert initial data
    setup()
    test()
