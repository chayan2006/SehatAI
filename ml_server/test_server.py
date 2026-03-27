
from flask import Flask, jsonify
import os

app = Flask(__name__)

@app.route('/')
def index():
    return "Test Server OK"

if __name__ == '__main__':
    print("Starting test server on 5001...")
    app.run(port=5001)
