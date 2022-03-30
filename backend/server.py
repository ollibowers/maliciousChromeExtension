from flask import Flask, request
from flask_cors import CORS

SERVER = Flask(__name__)
CORS(SERVER)

@SERVER.route("/", methods=["POST"])
def handle_inputs():
    print(request.remote_addr)
    print(request.json)
    return {}

if __name__ == "__main__":
    SERVER.run(port=5000)