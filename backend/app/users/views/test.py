import requests

# pour recup code
# https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-4c7bb90e2714f0dd74399beecabd17ce8b342b9e417e1cbab076aa38a3a16875&redirect_uri=https%3A%2F%2Flocalhost%2Foauth&response_type=code
# 

# RECU VIA LE FRONT-END
code = '68f7ed23017fe3be7b56cfc11c073cf6a3350453e75ab4669f08f59f7aa86be3'

# .ENV
client_id = 'u-s4t2ud-4c7bb90e2714f0dd74399beecabd17ce8b342b9e417e1cbab076aa38a3a16875'
client_secret = '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'
redirect_uri = 'https://localhost/oauth'

# VARIABLES GLOBALES
url = 'https://api.intra.42.fr/oauth/token'
url_me = 'https://api.intra.42.fr/v2/me'

def request_api_42():
    r = requests.post(url, data={'grant_type':'authorization_code',
                                 'client_id': client_id,
                                 'client_secret': client_secret,
                                 'code': code,
                                 'redirect_uri': redirect_uri})
    r = r.json()
    access_token = r['access_token']
    return access_token

def request_api_42_me(access_token):
    response_me = requests.get(url_me, headers={'Authorization': f'Bearer {access_token}'})
    response_me = response_me.json()
    return response_me['id'], response_me['login'], response_me['image']['link']

if __name__ == '__main__':
    access_token = request_api_42()
    print(access_token)
    response_me = request_api_42_me(access_token)
    print(response_me)
  
    
# python test.py
# 5dbc0bf1b9af8dd870e09683d3320985b69a3d17fcd2c9ee8d06eceda2ca7272
# (101681, 'stgerard', {'link': 'https://cdn.intra.42.fr/users/5f6ca68cc02f7d9d0c57d486f70a3b62/stgerard.jpg', 'versions': {'large': 'https://cdn.intra.42.fr/users/d58fabcde5a958b0d4c46a648f946195/large_stgerard.jpg', 'medium': 'https://cdn.intra.42.fr/users/2d3d8427ea2c3464326b5c77b4db0774/medium_stgerard.jpg', 'small': 'https://cdn.intra.42.fr/users/df956363d8425a4ba4a97495aed5e5f3/small_stgerard.jpg', 'micro': 'https://cdn.intra.42.fr/users/f89ce5d613b5dddeefb73717e1419e25/micro_stgerard.jpg'}})

# 'https://cdn.intra.42.fr/users/5f6ca68cc02f7d9d0c57d486f70a3b62/stgerard.jpg'