"""
Assignment #7: AJAX
"""

from flask import Flask, request, g

app = Flask(__name__)


@app.route("/albums")
def albums():
    """Returns a list of albums (with album_id, author, and title) in JSON."""
    # TODO complete the list of albums from albums.json
    return ""


@app.route("/albuminfo")
def albuminfo():
    album_id = request.args.get("album_id", None)
    if album_id:
        # TODO complete: return info on one album, including tracks
        return ""
    return ""


@app.route("/sample")
def sample():
    return app.send_static_file("index_static.html")


@app.route("/")
def index():
    return app.send_static_file("index.html")


if __name__ == "__main__":
    app.run()
