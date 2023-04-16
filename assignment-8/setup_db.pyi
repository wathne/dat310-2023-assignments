from sqlite3 import Connection


def create_user_table(conn: Connection) -> None: ...

def create_address_table(conn: Connection) -> None: ...

def add_user(
    conn: Connection,
    username: str,
    hash: str,
) -> int: ...

def insert_address(
    conn: Connection,
    name: str,
    email: str | None,
    tel: str | None,
    userid: int,
) -> int: ...

def update_address(
    conn: Connection,
    address: dict[str, str | int | None],
    userid: int,
) -> int: ...

def delete_address(
    conn: Connection,
    addressid: int,
    userid: int,
) -> int: ...

def get_user_addresses(
    conn: Connection,
    userid: int,
) -> list[dict[str, str | int | None]] | None: ...

def get_user_by_name(
    conn: Connection,
    username: str,
) -> dict[str, str | int | None] | None: ...

def get_user_by_id(
    conn: Connection,
    userid: int,
) -> dict[str, str | int | None] | None: ...

def get_hash_for_login(
    conn: Connection,
    username: str,
) -> str | None: ...

