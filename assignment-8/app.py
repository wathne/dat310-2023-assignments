"""Flask app.
"""

from flask import Flask
from flask import g
from flask import redirect
from flask import url_for
from sqlite3 import connect
from sqlite3 import Connection
from sqlite3 import Error as AnySqlite3Error
from typing import cast
from werkzeug.wrappers.response import Response


_database_path: str = r"./database.db"
app: Flask = Flask(import_name=__name__)
app.secret_key = "7503da98974f91e5945705068e8e9b07"


def get_db() -> Connection | None:
    if "db" not in g:
        try:
            g.db = connect(_database_path)
        except AnySqlite3Error as err:
            print(err)
            return None
    try:
        g.db.cursor()
    except AnySqlite3Error as err:
        print(err)
        return None
    return cast(Connection, g.db)


@app.teardown_appcontext
# pylint: disable-next=unused-argument
def teardown_db(exc: BaseException | None = None) -> None:
    if "db" in g:
        g.db.close()


@app.route("/")
@app.route("/index")
def index() -> Response | tuple[str, int]:
    db: Connection | None = get_db()
    if db is None:
        print("db is None.") # TODO: Delete this.
        print(f"db: {db}") # TODO: Delete this.
        return ("No database connection.", 500)

    print("db is not None.") # TODO: Delete this.
    print(f"db: {db}") # TODO: Delete this.
    return redirect(
        location=url_for(
            endpoint="static",
            filename="index.html",
        ),
        code=302,
    )


if __name__ == "__main__":
    app.run(debug=True)

