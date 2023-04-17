You will need Python 3.10+ and Flask.
```sh
pip install --user flask
```
I prefer to use pip with the "--user" flag.
It may be necessary to add Flask to the system $PATH.

**How to run:**
```sh
python app.py
firefox http://127.0.0.1:5000
```
Flask will use port 5000 by default.

**Obsolete or testing, please ignore the following:**
- **/templates directory**
- **app.user_info()**           - *"/user_info"*
- **app.clear_user()**          - *"/clear_user"*
- **app.session_info()**        - *"/session_info"*
- **app.clear_session()**       - *"/clear_session"*
- **app.test()**                - *"/test"*
- **app.login_deprecated()**    - *"/login_deprecated"*
