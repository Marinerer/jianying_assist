import requests

def get_users():
    url = 'https://chat.fyshark.com/api/v1/users/'
    
    headers = {
        'accept': '*/*',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQ5NDcyNDU3LTMzZmQtNDhmZS1hZGEzLWVkODJmOGI5MTdiZCJ9.Lm8LtNn7XOom7QtGYny6cMRoAr6FBh_btAru6j3BGDQ',
        'content-type': 'application/json',
        'cookie': 'token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQ5NDcyNDU3LTMzZmQtNDhmZS1hZGEzLWVkODJmOGI5MTdiZCJ9.Lm8LtNn7XOom7QtGYny6cMRoAr6FBh_btAru6j3BGDQ',
        'priority': 'u=1, i',
        'referer': 'https://chat.fyshark.com/admin',
        'sec-ch-ua': '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
    }
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        return response.json()
    else:
        return f"Request failed with status code {response.status_code}"

def rm_user(id):
    url = f'https://chat.fyshark.com/api/v1/users/{id}'
    headers = {
        'accept': '*/*',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQ5NDcyNDU3LTMzZmQtNDhmZS1hZGEzLWVkODJmOGI5MTdiZCJ9.Lm8LtNn7XOom7QtGYny6cMRoAr6FBh_btAru6j3BGDQ',
        'content-type': 'application/json',
        'cookie': 'token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQ5NDcyNDU3LTMzZmQtNDhmZS1hZGEzLWVkODJmOGI5MTdiZCJ9.Lm8LtNn7XOom7QtGYny6cMRoAr6FBh_btAru6j3BGDQ',
        'priority': 'u=1, i',
        'referer': 'https://chat.fyshark.com/admin',
        'sec-ch-ua': '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
    }
    
    response = requests.delete(url, headers=headers)
    
    if response.status_code == 200:
        return response.json()
    else:
        return f"Request failed with status code {response.status_code}"
    pass


# 调用方法
users_data = get_users()
for user in users_data:
    print(user['id'],user['name'],user['role'])
    if user['id'] not in ['49472457-33fd-48fe-ada3-ed82f8b917bd','e0f3b5c3-58cd-486d-bde3-dd756c43ce74','16c6ebed-faa3-422e-ace0-06241a52f25d','13944db2-0144-4a34-b95c-62f3606ec2e0','294697c5-5f9e-4022-ae38-2ba08b273e62']:
        rm_user(user['id'])