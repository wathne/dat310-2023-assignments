"""Functions for reading from JSON files and for writing to JSON files."""

from collections.abc import Generator
from contextlib import contextmanager
from json import dump
from json import JSONDecodeError
from json import load
from typing import Any
from typing import IO


@contextmanager
def _two_opened_json_files(
    file_paths: tuple[str, str],
    mode: str,
) -> Generator[
    tuple[IO[Any] | None, IO[Any] | None, OSError | None],
    None,
    None,
]:
    """A "with" statement context manager for opening two .json files.

    For internal use.
    Handles OSError when opening two .json files in a "with" statement.

    Args:
        file_paths: tuple[str, str]
        mode: str

    Yields:
        tuple[IO[Any] | None, IO[Any] | None, OSError | None]

    Raises:
    """

    json_file_0: IO[Any] | None = None
    json_file_1: IO[Any] | None = None
    json_file_error: OSError | None = None

    try:
        json_file_0 = open(file_paths[0], mode, encoding="utf-8", newline=None)
        json_file_1 = open(file_paths[1], mode, encoding="utf-8", newline=None)
    except OSError as json_file_error:
        yield (None, None, json_file_error)
    else:
        try:
            yield (json_file_0, json_file_1, None)
        except OSError as json_file_error:
            yield (None, None, json_file_error)
        finally:
            json_file_1.close()
            json_file_0.close()


@contextmanager
def _opened_json_file(
    file_path: str,
    mode: str,
) -> Generator[
    tuple[IO[Any] | None, OSError | None],
    None,
    None,
]:
    """A "with" statement context manager for opening a .json file.

    For internal use.
    Handles OSError when opening a .json file in a "with" statement.

    Args:
        file_path: str
        mode: str

    Yields:
        tuple[IO[Any] | None, OSError | None]

    Raises:
    """

    json_file: IO[Any] | None = None
    json_file_error: OSError | None = None

    try:
        json_file = open(file_path, mode, encoding="utf-8", newline=None)
    except OSError as json_file_error:
        yield (None, json_file_error)
    else:
        try:
            yield (json_file, None)
        except OSError as json_file_error:
            yield (None, json_file_error)
        finally:
            json_file.close()


def read_json(file_path: str) -> Any:
    """Read any object from a JSON file.

    Args:
        file_path: str

    Returns:
        Any

    Raises:
    """

    json_file: IO[Any] | None = None
    json_file_error: OSError | None = None

    with _opened_json_file(
        file_path,
        mode="rt",
    ) as (json_file, json_file_error):
        if json_file_error is not None:
            print(f"OSError: {json_file_error}")
            return None
        if json_file is not None:
            try:
                json_data: Any = load(json_file)
                return json_data
            except JSONDecodeError as json_decode_error:
                print(f"JSONDecodeError: {json_decode_error}")
                return None

    return None


def read_json_list(file_path: str) -> list[Any] | None:
    """Read a list from a JSON file.

    This restrictive version of read_json() will only return a list or None.
    See https://docs.python.org/3/library/json.html#json.JSONDecoder
    See https://docs.python.org/3/library/json.html#json.JSONEncoder

    Args:
        file_path: str

    Returns:
        list[Any] | None

    Raises:
    """

    json_data: Any = read_json(file_path)
    if isinstance(json_data, list):
        return json_data

    return None


def write_json(
    file_path: str,
    obj: Any,
) -> bool:
    """Write any object to a JSON file.

    WARNING! This will clear any existing data in the JSON file.

    Args:
        file_path: str
        obj: Any

    Returns:
        bool

    Raises:
    """

    json_file: IO[Any] | None = None
    json_file_error: OSError | None = None

    with _opened_json_file(
        file_path,
        mode="wt",
    ) as (json_file, json_file_error):
        if json_file_error is not None:
            print(f"OSError: {json_file_error}")
            return False
        if json_file is not None:
            try:
                dump(obj, json_file)
                return True
            except (RecursionError, TypeError, ValueError) as error:
                print(error)
                return False

    return False


def append_json(
    file_path: str,
    obj: Any,
) -> bool:
    """Append any object to a JSON file.

    The existing JSON data in the JSON file must be an array.
    See https://docs.python.org/3/library/json.html#json.JSONDecoder
    See https://docs.python.org/3/library/json.html#json.JSONEncoder

    Args:
        file_path: str
        obj: Any

    Returns:
        bool

    Raises:
    """

    json_list: list[Any] | None = read_json_list(file_path)
    if json_list is not None:
        json_list.append(obj)
        if write_json(file_path, obj=json_list):
            return True

        return False

    return False


def append_json_dict(
    file_path: str,
    dictionary: dict[Any, Any],
) -> bool:
    """Append a dictionary object to a JSON file.

    This restrictive version of append_json() will only append a dictionary.
    The existing JSON data in the JSON file must be an array.
    See https://docs.python.org/3/library/json.html#json.JSONDecoder
    See https://docs.python.org/3/library/json.html#json.JSONEncoder

    Args:
        file_path: str
        dictionary: dict[Any, Any]

    Returns:
        bool

    Raises:
    """

    if not isinstance(dictionary, dict):
        return False

    json_list: list[Any] | None = read_json_list(file_path)
    if json_list is not None:
        json_list.append(dictionary)
        if write_json(file_path, obj=json_list):
            return True

        return False

    return False


def _test_read_json() -> None:
    """Testing read_json().

    Args:

    Returns:

    Raises:
    """

    pass


def _test_read_json_list() -> None:
    """Testing read_json_list().

    Args:

    Returns:

    Raises:
    """

    pass


def _test_write_json() -> None:
    """Testing write_json().

    Args:

    Returns:

    Raises:
    """

    pass


def _test_append_json() -> None:
    """Testing append_json().

    Args:

    Returns:

    Raises:
    """

    pass


def _test_append_json_dict() -> None:
    """Testing append_json_dict().

    Args:

    Returns:

    Raises:
    """

    pass


if __name__ == "__main__":
    pass

    # Testing read_json().
    #_test_read_json()

    # Testing read_json_list().
    #_test_read_json_list()

    # Testing write_json().
    #_test_write_json()

    # Testing append_json().
    #_test_append_json()

    # Testing append_json_dict().
    #_test_append_json_dict()

