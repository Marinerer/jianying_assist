import requests
import time
from datetime import datetime

def get_orders_by_status(api_key, status, limit=1, offset=0):
    url = "https://api.cubyn.com/v3/parcels"
    headers = {
        "X-Application": api_key,
        "Content-Type": "application/json"
    }
    params = {
        "status": status,
        "limit": limit,
        "offset": offset
    }
    
    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        parcels = response.json()
        return parcels
    except requests.exceptions.HTTPError as err:
        print(f"HTTP error occurred: {err}")
        print(f"Response content: {response.content}")
        return None
    except Exception as err:
        print(f"An error occurred: {err}")
        return None

def cancel_parcel(api_key, parcel_id):
    url = f"https://api.cubyn.com/v2/parcels/{parcel_id}/cancel"
    headers = {
        "X-Application": api_key,
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.put(url, headers=headers)
        response.raise_for_status()
        print(f"content: {response.json()}")
        return response.json()
    except requests.exceptions.HTTPError as err:
        print(f"HTTP error occurred: {err}")
        print(f"Response content: {response.content}")
        return None
    except Exception as err:
        print(f"An error occurred: {err}")
        return None


def main():
    # 使用示例
    api_key = "5c266b96101cebe9b8d80470"
    status = "CREATED"
    # status = "DELIVERED"
    limit = 500  # 每次查询的订单数量
    offset = 0  # 初始偏移量
    
    for i in range(1):  # 循环3次
        orders = get_orders_by_status(api_key, status, limit=limit, offset=offset)
        if orders:
            for order in orders:
                first_name = order.get('firstName', '').lower()
                last_name = order.get('lastName', '').lower()
                address = order.get('address', {})
                order_id = order.get('id')
                created_at = order.get('createdAt')
                phone = order.get('phone')
                line1 = address.get('line1').lower()
                
                if  line1.find('123 rue lucien faure') > -1 and order.get('status') == 'CREATED':
                    print('找到神秘订单，开始取消')
                    print(order)
                    cancel_parcel(api_key,order_id)
                    # 打印订单详情
                    print(f"Order Time: {created_at}")
                    print(f"Order ID: {order_id}")
                    print(f"Recipient: {first_name.capitalize()} {last_name.capitalize()}")
                    print(f"Address: {address.get('line1')}, {address.get('city')}, {address.get('zip')}, {address.get('country')}")
                    print(f"Phone: {phone}")
                    print("-" * 40)
        else:
            print("No orders found or failed to retrieve orders")
        
        # 更新偏移量以获取下一批订单
        offset += limit
    

    
    
if __name__ == '__main__':
    while True:
        main()
        print(datetime.now().strftime('%Y-%m-%d %H:%M'))
        time.sleep(30)
        pass