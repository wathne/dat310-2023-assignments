"""Flask app.
"""

#from flask import current_app # current_app is a LocalProxy.
from flask import Flask # current_app real type.
from flask import g # g is a LocalProxy.
from flask import redirect
from flask import render_template
from flask import request # request is a LocalProxy.
from flask import session # session is a LocalProxy.
from flask import url_for
from flask.ctx import _AppCtxGlobals as ACG # g real type.
from flask.json import jsonify
from flask.sessions import SecureCookieSession as SCS # session real type.
from flask.wrappers import Request # request real type.
from flask.wrappers import Response
#from setup_db import create_user_table
#from setup_db import create_address_table
#from setup_db import add_user
from setup_db import insert_address
from setup_db import update_address
from setup_db import delete_address
from setup_db import get_user_addresses
from setup_db import get_user_by_name
#from setup_db import get_user_by_id
from setup_db import get_hash_for_login
from sqlite3 import connect
from sqlite3 import Connection
from sqlite3 import Error as AnySqlite3Error
from typing import cast
from werkzeug.local import LocalProxy as LP
from werkzeug.security import check_password_hash
from werkzeug.wrappers.response import Response as WerkzeugResponse


_database_path: str = r"./database.db"
app: Flask = Flask(import_name=__name__)
app.secret_key = "7503da98974f91e5945705068e8e9b07"


def get_database_connection() -> Connection | None:
    # pylint: disable=protected-access
    acg: ACG = cast(LP[ACG], g)._get_current_object()
    if "db_con" not in acg:
        try:
            acg.db_con = connect(database=_database_path)
        except AnySqlite3Error as err:
            print(err)
            return None
    try:
        acg.db_con.cursor()
    except AnySqlite3Error as err:
        print(err)
        return None
    return cast(Connection, acg.db_con)


@app.teardown_appcontext
def teardown_database_connection(exc: BaseException | None = None) -> None:
    # pylint: disable=protected-access
    acg: ACG = cast(LP[ACG], g)._get_current_object()
    if exc is not None:
        print(exc)
    if "db_con" in acg:
        try:
            acg.db_con.close()
        except Exception:
            pass


def load_user() -> None:
    # pylint: disable=protected-access
    acg: ACG = cast(LP[ACG], g)._get_current_object()
    acg.user = None

    scs: SCS = cast(LP[SCS], session)._get_current_object()
    scs_username: str | None = scs.get(key="username", default=None)
    scs_password: str | None = scs.get(key="password", default=None)
    if scs_username is None:
        return None
    if scs_password is None:
        return None

    db_con: Connection | None = get_database_connection()
    if db_con is None:
        return None
    db_user: dict[str, str | int | None] | None = None
    db_user_username: str | None = None
    db_user_userid: int | None = None
    db_user_pwhash: str | None = None

    try:
        db_user = get_user_by_name(conn=db_con, username=scs_username)
    except AnySqlite3Error as err:
        raise AnySqlite3Error(
            f"Could not get user '{scs_username}' from database."
        ) from err
    if db_user is None:
        return None

    db_user_username = cast(str | None, db_user.get("username", None))
    db_user_userid = cast(int | None, db_user.get("userid", None))
    if db_user_username is None:
        return None
    if db_user_userid is None:
        return None

    try:
        db_user_pwhash = get_hash_for_login(conn=db_con, username=scs_username)
    except AnySqlite3Error as err:
        raise AnySqlite3Error(
            f"Could not get user '{scs_username}' password hash from database."
        ) from err
    if db_user_pwhash is None:
        return None

    if check_password_hash(pwhash=db_user_pwhash, password=scs_password):
        acg.user = db_user_userid


@app.before_request
def before_request() -> WerkzeugResponse | Response | tuple[str, int] | None:
    # pylint: disable=protected-access
    acg: ACG = cast(LP[ACG], g)._get_current_object()
    request_: Request = cast(LP[Request], request)._get_current_object()
    db_con: Connection | None = get_database_connection()

    print(f"request_.endpoint: {request_.endpoint}") # TODO: Delete this.
    print(request_) # TODO: Delete this.

    if request_.endpoint == "static":
        #return None
        pass # TODO: Skip load_user() if style.css.

    # Do not call load_user() if endpoint is in whitelist.
    whitelist: set[str] = {
        "login",
        "user_info",
        "clear_user",
        "session_info",
        "clear_session",
    }
    if request_.endpoint in whitelist:
        print(f"{request_.endpoint} is on whitelist") # TODO: Delete this.
        return None

    if db_con is None:
        return ("No database connection.", 500)

    try:
        load_user()
    except AnySqlite3Error as err:
        print(err)
        pass # TODO: Do something here?

    if acg.user is None:
        return redirect(
            location=url_for(
                endpoint="login",
            ),
            code=302,
        )

    return None


@app.route("/user_info")
def user_info() -> tuple[str, int]:
    # pylint: disable=protected-access
    scs: SCS = cast(LP[SCS], session)._get_current_object()
    scs_username: str | None = scs.get(key="username", default=None)
    scs_password: str | None = scs.get(key="password", default=None)
    return (render_template(
        template_name_or_list="user_info.html",
        username=scs_username,
        password=scs_password,
    ), 200)


@app.route("/clear_user")
def clear_user() -> WerkzeugResponse | Response:
    # pylint: disable=protected-access
    scs: SCS = cast(LP[SCS], session)._get_current_object()
    scs.pop(key="username", default=None)
    scs.pop(key="password", default=None)
    return redirect(
        location=url_for(
            endpoint="user_info",
        ),
        code=302,
    )


@app.route("/session_info")
def session_info() -> tuple[str, int]:
    # pylint: disable=protected-access
    scs: SCS = cast(LP[SCS], session)._get_current_object()
    return (render_template(
        template_name_or_list="session_info.html",
        scs=scs,
    ), 200)


@app.route("/clear_session")
def clear_session() -> WerkzeugResponse | Response:
    # pylint: disable=protected-access
    scs: SCS = cast(LP[SCS], session)._get_current_object()
    scs.clear()
    return redirect(
        location=url_for(
            endpoint="session_info",
        ),
        code=302,
    )


@app.route("/test")
def test() -> tuple[str, int]:
    # pylint: disable=protected-access
    return (render_template(
        template_name_or_list="test.html",
    ), 200)


@app.route("/")
@app.route("/index")
def index() -> WerkzeugResponse | Response:
    # pylint: disable=protected-access
    acg: ACG = cast(LP[ACG], g)._get_current_object()
    print(f"acg.user: {acg.user}") # TODO: Delete this.

    return redirect(
        location=url_for(
            endpoint="static",
            filename="index.html",
        ),
        code=302,
    )


@app.route("/login", methods=["GET", "POST"])
def login() -> tuple[str, int]:
    # pylint: disable=protected-access
    acg: ACG = cast(LP[ACG], g)._get_current_object()
    request_: Request = cast(LP[Request], request)._get_current_object()
    scs: SCS = cast(LP[SCS], session)._get_current_object()
    db_con: Connection | None = get_database_connection()

    if request_.method == "POST":
        scs["username"] = request_.form.get(
            key="username",
            default=None,
            type=str,
        )
        scs["password"] = request_.form.get(
            key="password",
            default=None,
            type=str,
        )

        if db_con is None:
            return ("No database connection.", 500)

        try:
            load_user()
        except AnySqlite3Error as err:
            print(err)
            pass # TODO: Do something here?

        if acg.user is None:
            return (render_template(
                template_name_or_list="form_login_error.html",
            ), 200)

        return (render_template(
            template_name_or_list="form_login_success.html",
        ), 200)

    return (render_template(
        template_name_or_list="form_login.html",
    ), 200)


@app.route(
    "/addresses",
    methods=["GET", "PUT", "POST", "DELETE"],
)
def addresses() -> Response:
    # pylint: disable=protected-access
    acg: ACG = cast(LP[ACG], g)._get_current_object()
    request_: Request = cast(LP[Request], request)._get_current_object()
    db_con: Connection | None = get_database_connection()
    if db_con is None:
        return jsonify(None)

    if acg.user is None:
        return jsonify(None)

    # RESTful API: List elements.
    if request_.method == "GET":
        db_user_addresses: list[dict[str, str | int | None]] | None = None
        try:
            db_user_addresses = get_user_addresses(
                conn=db_con,
                userid=acg.user,
            )
        except AnySqlite3Error as err:
            print(err)
            return jsonify(None)
        if db_user_addresses is None:
            return jsonify(None)
        return jsonify(db_user_addresses)

    # RESTful API: Replace the entire collection.
    if request_.method == "PUT":
        # Not implemented.
        return jsonify(None)

    # RESTful API: Create a new element in the collection.
    if request_.method == "POST":
        form_name = request_.form.get(
            key="name",
            default=None,
            type=str,
        )
        form_email = request_.form.get(
            key="email",
            default=None,
            type=str,
        )
        form_tel = request_.form.get(
            key="tel",
            default=None,
            type=str,
        )
        if form_name is None:
            return jsonify(None)

        db_address_id: int = -1
        try:
            db_address_id = insert_address(
                conn=db_con,
                name=form_name,
                email=form_email,
                tel=form_tel,
                userid=acg.user,
            )
        except AnySqlite3Error as err:
            print(err)
            return jsonify(None)
        if db_address_id == -1:
            return jsonify(None)
        return jsonify(db_address_id)

    # RESTful API: Delete the entire collection.
    if request_.method == "DELETE":
        # Not implemented.
        return jsonify(None)

    return jsonify(None)


@app.route(
    "/addresses/<int:addressid>",
    methods=["GET", "PUT", "POST", "DELETE"],
)
def address(addressid: int | None = None) -> Response:
    # pylint: disable=protected-access
    acg: ACG = cast(LP[ACG], g)._get_current_object()
    request_: Request = cast(LP[Request], request)._get_current_object()
    db_con: Connection | None = get_database_connection()
    if db_con is None:
        return jsonify(None)

    if addressid is None:
        return jsonify(None)

    if acg.user is None:
        return jsonify(None)

    # RESTful API: Retrieve the representation of an element.
    if request_.method == "GET":
        # Not implemented.
        return jsonify(None)

    # RESTful API: Replace element, create if it doesn't exist.
    if request_.method == "PUT":
        #update_address
        return jsonify(None) # TODO: Implement this.

    # RESTful API: Generally not used.
    if request_.method == "POST":
        # Not implemented.
        return jsonify(None)

    # RESTful API: Delete the element.
    if request_.method == "DELETE":
        #delete_address
        return jsonify(None) # TODO: Implement this.

    return jsonify(None)


if __name__ == "__main__":
    app.run(debug=True)

