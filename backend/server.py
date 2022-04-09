from flask import Flask, request
from flask_cors import CORS
from json import dumps
from storage import Storage

SERVER = Flask(__name__)
CORS(SERVER)
STORAGE = Storage()

@SERVER.route("/", methods=["POST"])
def handle_inputs():
    try:
        STORAGE.store(request.remote_addr, request.json)
    except:
        print("Malformed request:", request)
    print(dumps(STORAGE.to_json(), indent=2))
    return {}

if __name__ == "__main__":
    SERVER.run(port=5000)