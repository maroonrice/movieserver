from flask import Flask, request, send_file, session, Response, redirect
import mimetypes
import os
import secrets
import time
import uuid
import urllib.parse
import requests
import jwt
from jwt.algorithms import RSAAlgorithm
import json
from cryptography.hazmat.primitives import serialization
import configparser

app = Flask(__name__, static_folder=None)
app.config['JSON_AS_ASCII'] = False
app.secret_key = secrets.token_hex()

config_ini = configparser.ConfigParser()
config_ini.read('config.ini', encoding='utf-8')

SESSION_EXPIRE_SECOND = 43200
SESSION_UPDATE_SECOND = 21600
CLIENT_ID = config_ini.get('DEFAULT', 'CLIENT_ID')
CLIENT_SECRET = config_ini.get('DEFAULT', 'CLIENT_SECRET')
MOVIE_FILE_DIR='file'

mimetypes.add_type('text/javascript', '.js')

def checkSession() -> bool:
    try:
        if int(time.time()) < int(session['expire']):
            updateSession()
            return True
        return False
    except:
        return False

def updateSession(name = None):
    try:
        expire = int(session['expire'])
    except:
        expire = 0
    if expire - int(time.time()) < SESSION_EXPIRE_SECOND - SESSION_UPDATE_SECOND:
        session['expire'] = int(time.time()) + SESSION_EXPIRE_SECOND
        session['nonce'] = str(uuid.uuid4())
        if name != None:
            session['name'] = name

@app.route('/', methods=['GET'])
def root():
    return redirect('/page/login/index.html')

@app.route('/page/<path:subpath>', methods=['GET'])
def page(subpath):
    mimetype, _ = mimetypes.guess_type(subpath)
    return send_file('page/dist/page/' + subpath, mimetype=mimetype)

@app.route('/assets/<path:subpath>', methods=['GET'])
def assets(subpath):
    mimetype, _ = mimetypes.guess_type(subpath)
    return send_file('page/dist/assets/' + subpath, mimetype=mimetype)


@app.route('/file/<path:subpath>', methods=['GET'])
def file_with_session(subpath):
    if not checkSession():
        return None, 403
    mimetype, _ = mimetypes.guess_type(subpath)
    return send_file(os.path.join(MOVIE_FILE_DIR, subpath), mimetype=mimetype)

def movieinfo(dirname: str) -> dict:
    image = os.path.join(MOVIE_FILE_DIR, dirname, 'thumb.png')
    base = '/file/' + urllib.parse.quote(dirname)
    if os.path.isfile(image):
        return {'name': dirname, 'image': base + '/thumb.png', 'path': base + '/video.m3u8'}
    return {'name': dirname, 'path': base + '/video.m3u8'}

@app.route('/api/files', methods=['GET'])
def api_files():
    if not checkSession():
        return {}, 403
    files = os.listdir(MOVIE_FILE_DIR)
    return [movieinfo(f) for f in files if os.path.isdir(os.path.join(MOVIE_FILE_DIR, f))]

@app.route('/api/login', methods=['GET'])
def api_login():
    state = str(uuid.uuid4())
    body = "&".join([
        'client_id=' + CLIENT_ID,
        'response_type=code',
        'scope=openid%20email',
        'redirect_uri=' + request.url_root + 'api/landing',
        'state=' + state
    ])
    response = redirect('https://accounts.google.com/o/oauth2/auth?' + body)
    response.set_cookie('oidc_state', state, max_age=300,expires=-1,httponly=True,samesite='Lax')
    return response

@app.route('/api/landing', methods=['GET'])
def api_landing():
    cookie_state = request.cookies['oidc_state']
    query_state = request.args.get('state')
    print(cookie_state, query_state)
    if cookie_state != query_state:
        return redirect('/page/error/index.html?message=' + urllib.parse.quote('認証エラーです。ログインしなおしてください。'))
    auth_code = request.args.get('code')
    print(auth_code)
    data = {
        "code": auth_code,
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        'redirect_uri': request.url_root + 'api/landing',
        'grant_type': 'authorization_code'
    }
    response = requests.post('https://www.googleapis.com/oauth2/v4/token', data=data)
    json = response.json()
    id_token = json['id_token']
    decoded = verify_jwt(id_token)
    updateSession(decoded['email'])
    return redirect('/page/list/index.html')

def verify_jwt(id_token):
    header = jwt.get_unverified_header(id_token)
    kid = header['kid']
    certres = requests.get('https://www.googleapis.com/oauth2/v3/certs')
    certjson = certres.json()
    keyinfo = [key for key in list(certjson['keys']) if key['kid'] == kid][0]
    jwk_json = json.dumps(keyinfo)
    public_key = RSAAlgorithm.from_jwk(jwk_json)
    pem = public_key.public_bytes(encoding=serialization.Encoding.PEM, format=serialization.PublicFormat.SubjectPublicKeyInfo)
    decoded = jwt.decode(id_token, pem, algorithms=['RS256'], audience=CLIENT_ID)
    return dict({(key, decoded.get(key)) for key in decoded.keys()})

@app.route('/api/session', methods=['GET'])
def api_session():
    if not checkSession():
        return {}, 403
    return {'name': session['name']}, 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=9081, threaded=True)
