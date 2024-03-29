from sqlite3 import Connection


database: str = ...

def create_connection(db_file: str) -> Connection: ...

sql_create_courses_table: str = ...

sql_create_students_table: str = ...

sql_create_grades_table: str = ...

def create_table(
    conn: Connection,
    create_table_sql: str,
) -> None: ...

def add_student(
    conn: Connection,
    student_no: int,
    name: str,
) -> None: ...

def init_students(conn: Connection) -> None: ...

def add_course(
    conn: Connection,
    id: str,
    name: str,
) -> None: ...

def init_courses(conn: Connection) -> None: ...

def add_grade(
    conn: Connection,
    course_id: str,
    student_no: int,
    grade: str,
) -> None: ...

def init_grades(conn: Connection) -> None: ...

def select_students(conn: Connection) -> list[dict[str, int | str]]: ...

def select_courses(conn: Connection) -> list[dict[str, str]]: ...

def select_grades(conn: Connection) -> list[dict[str, int | str]]: ...

def setup() -> None: ...

