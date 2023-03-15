"""
Flask: Using templates
"""


from flask import Flask, render_template, request, redirect, url_for, g

app = Flask(__name__)



@app.route("/")
def index():
    # get the database connection
    return render_template("index.html", 
                    # get the list of students
                    students=[])


# Add additional routes here.


if __name__ == "__main__":
    app.run(debug=True)