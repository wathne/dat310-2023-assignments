"""Flask app.

course: {
    "course_id": str,
    "name": str,
}
grade: {
    "student_no": int,
    "course_id": str,
    "grade": str,
}
student: {
    "student_no": int,
    "name": str,
}

add_course(conn, id, name)
add_grade(conn, course_id, student_no, grade)
add_student(conn, student_no, name)
"""

from flask import Flask
from flask import g
from flask import render_template
from flask import request
from flask import redirect
from flask import url_for
#from setup_db import add_course
from setup_db import add_grade
from setup_db import add_student
from setup_db import create_connection
from setup_db import select_courses
from setup_db import select_grades
from setup_db import select_students
from sqlite3 import Connection
#from typing import Any
from werkzeug.local import LocalProxy
from werkzeug.wrappers.response import Response


_database: str = r"./database.db"
app: Flask = Flask(import_name=__name__)
app.secret_key = "60c0b19326352a4b247c149cc6690a20"


def get_db() -> Connection | None:
    return g.setdefault( # type: ignore [no-any-return]
        name="db",
        # pylint: disable-next=line-too-long
        default=create_connection(db_file=_database), # type: ignore [no-untyped-call]
    )


db: LocalProxy[Connection | None] | Connection | None = None
if callable(get_db):
    db = LocalProxy(local=get_db)


@app.teardown_appcontext
# pylint: disable-next=unused-argument
def teardown_db(exc: BaseException | None = None) -> None:
    db_popped: Connection | None = g.pop(name="db", default=None)
    if db_popped is not None:
        db_popped.close()


@app.route("/")
@app.route("/index")
def index() -> tuple[str, int]:
    if db is None:
        return ("No database connection.", 500)
    # pylint: disable-next=line-too-long
    courses: list[dict[str, str]] = select_courses(conn=db) # type: ignore [no-untyped-call]
    # pylint: disable-next=line-too-long
    students: list[dict[str, int | str]] = select_students(conn=db) # type: ignore [no-untyped-call]

    courses_sorted: list[dict[str, str]] = sorted(
        courses,
        key=lambda c: c["course_id"],
    )
    students_sorted: list[dict[str, int | str]] = sorted(
        students,
        key=lambda s: s["student_no"],
    )

    return (render_template(
        template_name_or_list="index.html",
        courses=courses_sorted,
        students=students_sorted,
    ), 200)


@app.route("/add_student")
def form_add_student() -> tuple[str, int]:
    return (render_template(
        template_name_or_list="form_add_student.html",
    ), 200)


@app.route("/sendform_add_student", methods=["POST"])
def sendform_add_student() -> Response | tuple[str, int]:
    form_name: str = request.form.get(key="name", default="", type=str)
    if not form_name:
        return (render_template(
            template_name_or_list="form_add_student_error.html",
        ), 200)

    if db is None:
        return ("No database connection.", 500)
    # pylint: disable-next=line-too-long
    students: list[dict[str, int | str]] = select_students(conn=db) # type: ignore [no-untyped-call]

    reserved: set[int] = set()
    for student in students:
        reserved.add(int(student["student_no"]))

    next_student_no: int = 100000
    while next_student_no < 999999:
        if next_student_no not in reserved:
            break
        next_student_no += 1

    add_student(
        conn=db,
        student_no=next_student_no,
        name=form_name,
    ) # type: ignore [no-untyped-call]
    return redirect(location=url_for("index"), code=302)


@app.route("/add_grade")
@app.route("/add_grade", methods=["POST"])
@app.route("/add_grade_<source>")
def form_add_grade(
    source: int | str | None = None,
) -> tuple[str, int]:
    locked_course_id: str | None = request.form.get(
        key="locked_course_id",
        default="",
        type=str,
    )
    if not locked_course_id:
        locked_course_id = None
    locked_student_no: int | None = request.form.get(
        key="locked_student_no",
        default=None,
        type=int,
    )
    if locked_course_id is not None:
        source = locked_course_id
    if locked_student_no is not None:
        source = locked_student_no

    if db is None:
        return ("No database connection.", 500)
    # pylint: disable-next=line-too-long
    courses: list[dict[str, str]] = select_courses(conn=db) # type: ignore [no-untyped-call]
    # pylint: disable-next=line-too-long
    students: list[dict[str, int | str]] = select_students(conn=db) # type: ignore [no-untyped-call]

    if source is None:
        return (render_template(
            template_name_or_list="form_add_grade.html",
            courses=courses,
            students=students,
            locked_course_id=None,
            locked_student_no=None,
            form_course_id=None,
            form_grade=None,
            form_student_no=None,
        ), 200)

    course: dict[str, str]
    for course in courses:
        if str(course["course_id"]) != str(source):
            continue
        return (render_template(
            template_name_or_list="form_add_grade.html",
            courses=courses,
            students=students,
            locked_course_id=course["course_id"],
            locked_student_no=None,
            form_course_id=None,
            form_grade=None,
            form_student_no=None,
        ), 200)

    student: dict[str, int | str]
    for student in students:
        if int(student["student_no"]) != int(source):
            continue
        return (render_template(
            template_name_or_list="form_add_grade.html",
            courses=courses,
            students=students,
            locked_course_id=None,
            locked_student_no=student["student_no"],
            form_course_id=None,
            form_grade=None,
            form_student_no=None,
        ), 200)

    return (render_template(
        template_name_or_list="form_add_grade.html",
        courses=courses,
        students=students,
        locked_course_id=None,
        locked_student_no=None,
        form_course_id=None,
        form_grade=None,
        form_student_no=None,
    ), 200)


@app.route("/sendform_add_grade")
@app.route("/sendform_add_grade", methods=["POST"])
@app.route("/sendform_add_grade_<source>")
def sendform_add_grade(
    source: int | str | None = None,
) -> Response | tuple[str, int]:
    locked_course_id: str | None = request.form.get(
        key="locked_course_id",
        default="",
        type=str,
    )
    if not locked_course_id:
        locked_course_id = None
    locked_student_no: int | None = request.form.get(
        key="locked_student_no",
        default=None,
        type=int,
    )
    if locked_course_id is not None:
        source = locked_course_id
    if locked_student_no is not None:
        source = locked_student_no

    form_course_id: str | None = request.form.get(
        key="course_id",
        default="",
        type=str,
    )
    if not form_course_id:
        form_course_id = None
    form_grade: str | None = request.form.get(
        key="grade",
        default="",
        type=str,
    )
    if not form_grade:
        form_grade = None
    form_student_no: int | None = request.form.get(
        key="student_no",
        default=None,
        type=int,
    )

    if db is None:
        return ("No database connection.", 500)
    # pylint: disable-next=line-too-long
    courses: list[dict[str, str]] = select_courses(conn=db) # type: ignore [no-untyped-call]
    # pylint: disable-next=line-too-long
    students: list[dict[str, int | str]] = select_students(conn=db) # type: ignore [no-untyped-call]

    bad_form: bool = False
    if form_course_id is None:
        bad_form = True
    if form_student_no is None:
        bad_form = True
    if form_grade is None:
        bad_form = True

    # TODO: Modify old grade, else add new grade.

    if not bad_form:
        add_grade(
            conn=db,
            course_id=form_course_id,
            student_no=form_student_no,
            grade=form_grade,
        ) # type: ignore [no-untyped-call]

        # TODO: Check if this grade is in the database.

        return (render_template(
            template_name_or_list="form_add_grade_success.html",
        ), 200)

    if source is None:
        return (render_template(
            template_name_or_list="form_add_grade_error.html",
            courses=courses,
            students=students,
            locked_course_id=None,
            locked_student_no=None,
            form_course_id=form_course_id,
            form_grade=form_grade,
            form_student_no=form_student_no,
        ), 200)

    course: dict[str, str]
    for course in courses:
        if str(course["course_id"]) != str(source):
            continue
        return (render_template(
            template_name_or_list="form_add_grade_error.html",
            courses=courses,
            students=students,
            locked_course_id=course["course_id"],
            locked_student_no=None,
            form_course_id=form_course_id,
            form_grade=form_grade,
            form_student_no=form_student_no,
        ), 200)

    student: dict[str, int | str]
    for student in students:
        if int(student["student_no"]) != int(source):
            continue
        return (render_template(
            template_name_or_list="form_add_grade_error.html",
            courses=courses,
            students=students,
            locked_course_id=None,
            locked_student_no=student["student_no"],
            form_course_id=form_course_id,
            form_grade=form_grade,
            form_student_no=form_student_no,
        ), 200)

    return (render_template(
        template_name_or_list="form_add_grade_error.html",
        courses=courses,
        students=students,
        locked_course_id=None,
        locked_student_no=None,
        form_course_id=form_course_id,
        form_grade=form_grade,
        form_student_no=form_student_no,
    ), 200)


@app.route("/course/<course_id>")
def template_course(
    course_id: str | None = None,
) -> Response | tuple[str, int]:
    if db is None:
        return ("No database connection.", 500)
    # pylint: disable-next=line-too-long
    courses: list[dict[str, str]] = select_courses(conn=db) # type: ignore [no-untyped-call]
    grades: list[dict[str, int | str]]
    students: list[dict[str, int | str]]
    course: dict[str, str]
    grade: dict[str, int | str]
    student: dict[str, int | str]
    grades_and_students: list[dict[str, str]] = []
    grades_and_students_sorted: list[dict[str, str]]
    grade_count: dict[str, int] = {
        "a": 0,
        "b": 0,
        "c": 0,
        "d": 0,
        "e": 0,
        "f": 0,
        "x": 0,
    }

    for course in courses:
        if str(course["course_id"]) != str(course_id):
            continue
        grades = select_grades(conn=db) # type: ignore [no-untyped-call]
        for grade in grades:
            if str(grade["course_id"]) != str(course["course_id"]):
                continue
            students = select_students(conn=db) # type: ignore [no-untyped-call]
            for student in students:
                if int(student["student_no"]) != int(grade["student_no"]):
                    continue
                grades_and_students.append({
                    "name": str(student["name"]),
                    "grade": str(grade["grade"]),
                })
                match "".join(str(grade["grade"]).split()).lower():
                    case "a":
                        grade_count["a"] += 1
                    case "b":
                        grade_count["b"] += 1
                    case "c":
                        grade_count["c"] += 1
                    case "d":
                        grade_count["d"] += 1
                    case "e":
                        grade_count["e"] += 1
                    case "f":
                        grade_count["f"] += 1
                    case _:
                        grade_count["x"] += 1
        grades_and_students_sorted = sorted(
            grades_and_students,
            key=lambda gs: gs["grade"],
        )
        return (render_template(
            template_name_or_list="course_id.html",
            course=course,
            grades_and_students=grades_and_students_sorted,
            grade_count=grade_count,
        ), 200)
    # TODO: 404 page.
    return redirect(location=url_for("index"), code=404)


@app.route("/student/<student_no>")
def template_student(
    student_no: str | None = None,
) -> Response | tuple[str, int]:
    if db is None:
        return ("No database connection.", 500)
    courses: list[dict[str, str]]
    grades: list[dict[str, int | str]]
    # pylint: disable-next=line-too-long
    students: list[dict[str, int | str]] = select_students(conn=db) # type: ignore [no-untyped-call]
    course: dict[str, str]
    grade: dict[str, int | str]
    student: dict[str, int | str]
    courses_and_grades: list[dict[str, str]] = []
    courses_and_grades_sorted: list[dict[str, str]]

    for student in students:
        if str(student["student_no"]) != str(student_no):
            continue
        grades = select_grades(conn=db) # type: ignore [no-untyped-call]
        for grade in grades:
            if int(grade["student_no"]) != int(student["student_no"]):
                continue
            courses = select_courses(conn=db) # type: ignore [no-untyped-call]
            for course in courses:
                if str(course["course_id"]) != str(grade["course_id"]):
                    continue
                courses_and_grades.append({
                    "course_id": course["course_id"],
                    "name": course["name"],
                    "grade": str(grade["grade"]),
                })
        courses_and_grades_sorted = sorted(
            courses_and_grades,
            key=lambda cg: cg["course_id"],
        )
        return (render_template(
            template_name_or_list="student_no.html",
            student=student,
            courses_and_grades=courses_and_grades_sorted,
        ), 200)
    # TODO: 404 page.
    return redirect(location=url_for("index"), code=404)


if __name__ == "__main__":
    app.run(debug=True)

