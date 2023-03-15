import json

GRADES_FILE = r"./grades.json"
COURSES_FILE = r"./courses.json"
STUDENTS_FILE = r"./students.json"

def create_file(filename):
    try:
        # create file
        with open(filename, 'x') as fp:
            pass
    except:
        print('{filename} already exists')

def init_files():
    create_file(GRADES_FILE)
    create_file(COURSES_FILE)
    create_file(STUDENTS_FILE)

#### INSERT #########

def add_student(student_no, name):
    """
    Add a new student into the students table
    :param conn:
    :param student_no:
    :param name:
    """
    newstudent = {
        "student_no": student_no, 
        "name": name
    }
    addJSON(STUDENTS_FILE,newstudent)
    
def init_students():
    init = [(111111,"John Smith"),
            (222222,"Mary Jane"),
            (333333,"Lars Kongen")]
    for s in init:
        add_student(s[0], s[1])

def add_course(id, name):
    """
    Add a new student into the students table
    :param conn:
    :param id:
    :param name:
    """
    newcourse = { 
            "course_id": id, 
            "name": name
            }
    addJSON(COURSES_FILE, newcourse)
    
    
def init_courses():
    init = [("MAT100"," Mathematical methods I."),
            ("MAT200"," Mathematical methods II."),
            ("DAT100"," Object-oriented programming"),
            ("DAT200"," Algorithms and data structures"),
            ("DAT220"," Databases"),
            ("DAT310"," Web programming"),
            ("DAT320"," Operating Systems")]
    for c in init:
        add_course(c[0], c[1])

def add_grade(course_id, student_no, grade):
    """
    Add a new student into the students table
    :param conn:
    :param id:
    :param name:
    :return: id
    """
    newgrade = { 
            "student_no": student_no,
            "course_id": course_id, 
            "grade": grade
            }
    addJSON(GRADES_FILE,newgrade)
    

def init_grades():
    init = [(111111," MAT100", " B"),
            (222222," MAT100", " D"),
            (333333," MAT100", " A"),
            (111111," MAT200", " C"),
            (222222," MAT200", " C"),
            (333333," MAT200", " A"),
            (111111," DAT100", " B"),
            (222222," DAT100", " C"),
            (333333," DAT100", " A"),
            (111111," DAT200", " C"),
            (222222," DAT200", " D"),
            (333333," DAT200", " A"),
            (111111," DAT220", " C"),
            (222222," DAT220", " B"),
            (333333," DAT220", " A"),
            (222222," DAT310", " A"),
            (333333," DAT310", " B"),
            (333333," DAT320", " A")]

    for g in init:
        add_grade(g[1],g[0], g[2])




#### SELECT #######

def select_students():
    # return all students
    return readJSON(STUDENTS_FILE)

def select_courses():
    # return all courses
    return readJSON(COURSES_FILE)

def select_grades():
    # return all grades
    return readJSON(GRADES_FILE)

    
#### JSON #######

def readJSON(filename):
    jsonlist = []
    with open(filename, "r") as f:
        filecontent = f.read()
        #print("File contains: {}".format(filecontent))
        if filecontent == "":
            print("Empty file")
        else:
            jsonlist = json.loads(filecontent)
    return jsonlist

def writeJSON(filename, data):
    jsonstring = json.dumps(data)
    with open(filename, "w") as f:
        f.write(jsonstring)

def addJSON(filename, object):
    jsonlist = readJSON(filename)
    if type(jsonlist) != list:
        print(jsonlist)
        raise ValuyError("JSON file {filename} did not contain a list")
    else:
        jsonlist.append(object)
        writeJSON(filename, jsonlist)

#### SETUP ####

def setup():
    init_files()
    init_students()
    init_courses()
    init_grades()

    print("Testing if courses are written correctly:")
    print(select_courses())

    

if __name__ == '__main__':
    # If executed as main, this will create tables and insert initial data
    setup()

