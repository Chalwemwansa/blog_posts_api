#!/usr/bin/env python3
import requests

file_name = 'planets_collide.jpeg'

pictures = [
    ('pictures', (file_name, open(file_name, "rb")))
]
print(pictures)
# Instead of json=r_json, use data=r_json to include form data
r_data = {'name': file_name, 'type': 'image'}
r_headers = {'token': '6c873f34-639d-4b25-ab8a-a13fe9e1ff39'}

r = requests.post("http://0.0.0.0:5000/post", files=pictures, data=r_data, headers=r_headers)
print(r.status_code)
print(r.json())
