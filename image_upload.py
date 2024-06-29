#!/usr/bin/env python3
import requests

file_name = 'planets_collide.jfif'
file_name2 = 'IMG_20231107_155610_677.jpg'

data = {
    'name': 'chalwe',
    'email': 'chalwe@gmail.com',
    'password': 'chalwe'
}

pic = [
    ('picture', (file_name2, open(file_name2, "rb")))
]

response = requests.post('http://localhost:5000/signup', files=pic, data=data)
token = response.json()['token']

pictures = [
    ('pictures', (file_name, open(file_name, "rb"))),
    ('pictures', (file_name2, open(file_name2, "rb")))
]
# Instead of json=r_json, use data=r_json to include form data
r_data = {'name': 'first', 'type': 'games'}
r_headers = {'token': f'{token}'}

r = requests.post("http://0.0.0.0:5000/post", files=pictures, data=r_data, headers=r_headers)
print(r.status_code)
print(r)
#print(r.json())
