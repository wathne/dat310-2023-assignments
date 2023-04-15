"""Flask app.

RESTful API:
    GET    ~> get_user_addresses
    POST   ~> insert_address
    PUT    ~> update_address
    DELETE ~> delete_address

    GET /addresses:
        body:     N/A
        response: json[list[dict[str, str | int | None]]] | json[None]
    POST /addresses:
        body:     json[dict[str, str | None]]
        response: json[int] | json[None]
    PUT /addresses/<addressid>:
        body:     json[dict[str, str | None]]
        response: json[int] | json[None]
    DELETE /addresses/<addressid>:
        body:     Any
        response: json[int] | json[None]
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


@app.route(rule="/user_info")
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


@app.route(rule="/clear_user")
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


@app.route(rule="/session_info")
def session_info() -> tuple[str, int]:
    # pylint: disable=protected-access
    scs: SCS = cast(LP[SCS], session)._get_current_object()
    return (render_template(
        template_name_or_list="session_info.html",
        scs=scs,
    ), 200)


@app.route(rule="/clear_session")
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


@app.route(rule="/test")
def test() -> tuple[str, int]:
    # pylint: disable=protected-access
    return (render_template(
        template_name_or_list="test.html",
    ), 200)


@app.route(rule="/")
@app.route(rule="/index")
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


@app.route(rule="/login", methods=["GET", "POST"])
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
    rule="/addresses",
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

    request_dict: dict[str, str | None] | None = None
    request_dict_name: str | None = None
    request_dict_email: str | None = None
    request_dict_tel: str | None = None
    if request_.is_json:
        request_dict = request_.get_json(force=False, silent=True, cache=True)
        print(f"request_dict: {request_dict}") # TODO: Delete this.
    if isinstance(request_dict, dict):
        request_dict_name = request_dict.get("name", None)
        request_dict_email = request_dict.get("email", None)
        request_dict_tel = request_dict.get("tel", None)
        print(f"request_dict['name']: {request_dict['name']}") # TODO: Delete.
        print(f"request_dict['email']: {request_dict['email']}") # TODO: Delete.
        print(f"request_dict['tel']: {request_dict['tel']}") # TODO: Delete.

    db_user_addresses: list[dict[str, str | int | None]] | None = None
    db_new_addressid: int = -1

    # RESTful API: List elements.
    if request_.method == "GET":
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
        if request_dict_name is None:
            return jsonify(None)
        try:
            db_new_addressid = insert_address(
                conn=db_con,
                name=request_dict_name,
                email=request_dict_email,
                tel=request_dict_tel,
                userid=acg.user,
            )
        except AnySqlite3Error as err:
            print(err)
            return jsonify(None)
        if db_new_addressid == -1:
            return jsonify(None)
        return jsonify(db_new_addressid)

    # RESTful API: Delete the entire collection.
    if request_.method == "DELETE":
        # Not implemented.
        return jsonify(None)

    return jsonify(None)


@app.route(
    rule="/addresses/<int:addressid>",
    methods=["GET", "PUT", "POST", "DELETE"],
)
def address(addressid: int | None = None) -> Response:
    # pylint: disable=protected-access
    acg: ACG = cast(LP[ACG], g)._get_current_object()
    request_: Request = cast(LP[Request], request)._get_current_object()
    db_con: Connection | None = get_database_connection()
    if db_con is None:
        return jsonify(None)

    if acg.user is None:
        return jsonify(None)

    if addressid is None:
        return jsonify(None)

    request_dict: dict[str, str | None] | None = None
    request_dict_name: str | None = None
    request_dict_email: str | None = None
    request_dict_tel: str | None = None
    if request_.is_json:
        request_dict = request_.get_json(force=False, silent=True, cache=True)
        print(f"request_dict: {request_dict}") # TODO: Delete this.
    if isinstance(request_dict, dict):
        request_dict_name = request_dict.get("name", None)
        request_dict_email = request_dict.get("email", None)
        request_dict_tel = request_dict.get("tel", None)
        print(f"request_dict['name']: {request_dict['name']}") # TODO: Delete.
        print(f"request_dict['email']: {request_dict['email']}") # TODO: Delete.
        print(f"request_dict['tel']: {request_dict['tel']}") # TODO: Delete.

    db_update_address_success: int = 0
    db_delete_address_success: int = 0

    # RESTful API: Retrieve the representation of an element.
    if request_.method == "GET":
        # Not implemented.
        return jsonify(None)

    # RESTful API: Replace element, create if it doesn't exist.
    if request_.method == "PUT":
        if request_dict_name is None:
            return jsonify(None)
        try:
            db_update_address_success = update_address(
                conn=db_con,
                address={
                    "name": request_dict_name,
                    "email": request_dict_email,
                    "tel": request_dict_tel,
                    "id": addressid,
                },
                userid=acg.user,
            )
        except AnySqlite3Error as err:
            print(err)
            return jsonify(None)
        if db_update_address_success == 0:
            return jsonify(None)
        return jsonify(db_update_address_success)

    # RESTful API: Generally not used.
    if request_.method == "POST":
        # Not implemented.
        return jsonify(None)

    # RESTful API: Delete the element.
    if request_.method == "DELETE":
        try:
            db_delete_address_success = delete_address(
                conn=db_con,
                addressid=addressid,
                userid=acg.user,
            )
        except AnySqlite3Error as err:
            print(err)
            return jsonify(None)
        if db_delete_address_success == 0:
            return jsonify(None)
        return jsonify(db_delete_address_success)

    return jsonify(None)


if __name__ == "__main__":
    app.run(debug=True)

