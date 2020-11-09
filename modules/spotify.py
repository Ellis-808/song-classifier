import base64
import requests

# API Reference
# https://developer.spotify.com/documentation/web-api/reference/
class Spotify:

    def __init__(self):
        self.__client_id = ''
        self.__client_secret = ''
        self.__access_token = ''
        self.__refresh_token = ''

    def __authorize(self):
        if self.__refresh_token != '':
            # refresh connection
            pass
        else:
            # start connection
            converted = (self.__client_id + ":" + self.__client_secret).encode('ascii')
            auth_header = f'Basic {base64.b64encode(converted)}'
            auth_url = 'https://accounts.spotify.com/api/token'
            request = requests.post(auth_url, data={'grant_type': 'client_credentials'}, headers={'Authorization': auth_header})
            # request = urllib.request.Request(auth_url, , {'Authorization': auth_header}, method='POST')
            print(request.reason)

        return

    def __refresh(self):
        pass

    def get_song_id(self, title, artist, album=None):
        try:
            #Query
            pass
        except:
            self.__refresh()
            return self.get_song_id(title, artist, album)


# https://developer.spotify.com/documentation/web-api/reference/tracks/get-audio-analysis/
#  GET https://api.spotify.com/v1/audio-analysis/{id}
    def get_audio_metadata(self, song_id):
        try:
            #GET
            pass
        except:
            self.__refresh()

        return
    
    def get_top100_audio_metadata(self, genre=None):
        pass


spotify = Spotify()

# url = 'https://api.spotify.com/v1/search?type=artist&q=snoop'
# f = urllib.request.urlopen(url)
# print( f.read().decode('utf-8'))