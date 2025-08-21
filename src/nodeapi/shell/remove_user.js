const axios = require('axios');

async function getMemberDetails() {
  
    let url = 'https://www.coze.cn/api/playground_api/space/member/detail'
    let data = {
      space_id: '7373865327308144674',
      page: 1,
      size: 100
    }

    let res =  await http_post(url,data)
    await get_member(res)
  
}


async function http_post(url,data){


    try {
        const response = await axios.post(url, data, {
          headers: {
            'accept': 'application/json, text/plain, */*',
            'accept-language': 'zh-CN',
            'agw-js-conv': 'str',
            'content-type': 'application/json',
            'cookie': 'i18next=zh-CN; d_ticket=c95c5c3434a0c43dba2bc593f3ff98f92d2e7; store-region=cn-gd; store-region-src=uid; is_staff_user=false; passport_mfa_token=CjgAbF9jOZGNiEN5HIrryvlvobArLAew%2F9ubSOnQbbBHfFZK9fgZ0gblUXIK2EcBhMNJRxyPNMN1hRpKCjyissWqx2503Wgh5EvzX4dJZyEGVunfeSfXQZiYYvefK3w543XdyLH2HvENAySgAAFGTPZ7VqKqdvLYKlsQraHbDRj2sdFsIAIiAQN%2F3x%2Fu; odin_tt=3557328d2943b73ad932fe2eb652fef88a22d0beb1595948a4ff445e534a04aba8ab76b93cf3775de2df86c3dda9461314e288ded873f126f33afbd1c69246e5; n_mh=vUwEDBzJFPoPj49XnY4NS6DJLMrRpeDin3Z9q7j7b6E; passport_auth_status=e12880d7110ac0f7ac30f78848824cba%2C9566f12b92764675897edf8ccc46e3ea; passport_auth_status_ss=e12880d7110ac0f7ac30f78848824cba%2C9566f12b92764675897edf8ccc46e3ea; sid_guard=0ed6c114c4d12d44393c0e3115d5d44b%7C1725493567%7C5184000%7CSun%2C+03-Nov-2024+23%3A46%3A07+GMT; uid_tt=7262dd0e3bb426c1a5673dce7e362eb0; uid_tt_ss=7262dd0e3bb426c1a5673dce7e362eb0; sid_tt=0ed6c114c4d12d44393c0e3115d5d44b; sessionid=0ed6c114c4d12d44393c0e3115d5d44b; sessionid_ss=0ed6c114c4d12d44393c0e3115d5d44b; sid_ucp_v1=1.0.0-KDg3ZThiZTc5ODkzNjViNjczYzU5NGExYjI3ZjRmYzRkMDY1ODcwZWEKIAiOj-Ch4ozbBhC_4uO2BhjHkB8gDDCZh4mbBjgCQPEHGgJscSIgMGVkNmMxMTRjNGQxMmQ0NDM5M2MwZTMxMTVkNWQ0NGI; ssid_ucp_v1=1.0.0-KDg3ZThiZTc5ODkzNjViNjczYzU5NGExYjI3ZjRmYzRkMDY1ODcwZWEKIAiOj-Ch4ozbBhC_4uO2BhjHkB8gDDCZh4mbBjgCQPEHGgJscSIgMGVkNmMxMTRjNGQxMmQ0NDM5M2MwZTMxMTVkNWQ0NGI; ttwid=1%7CZySIU91PQ70-Ucr7sIgpAU1dHT-UgE3vRLiW4zAKexY%7C1727534698%7C545e9f52393c10bbdc7f36e863fc7e89e4c666760b0131773d2fae268dab9b3f',
            'priority': 'u=1, i',
            'referer': 'https://www.coze.cn/space/7373865327308144674/team',
            'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) translate_video/1.8.2 Chrome/126.0.6478.185 Electron/31.3.1 Safari/537.36',
            'x-requested-with': 'XMLHttpRequest'
          }
        });
    
        return response.data
      } catch (error) {
        console.error('Error fetching data:', error);
        return null
      }

}


async function get_member(infos){

    // console.log(infos.data.member_info_list)

    for (let item of infos.data.member_info_list) {
        if(item.space_role_type == 1 ){
            continue
        }

        // Convert join_date from string to number
        let joinDateUnix = parseInt(item.join_date);

        // Get the current date in Unix timestamp (seconds since epoch)
        let currentUnix = Math.floor(Date.now() / 1000);

        // Calculate the difference in days
        let daysDifference = (currentUnix - joinDateUnix) / (60 * 60 * 24);

        // Check if the difference is greater than 10 days
        if (daysDifference > 18) {
            console.log(item.user_id)
            remove_user(item.user_id)
        } else {
            
        }
    }


}

async function  remove_user(user_id){
    let url = "https://www.coze.cn/api/playground_api/space/member/remove"
    let data = {
        "space_id": "7373865327308144674",
        "remove_user_id": user_id
      }
    let res = await http_post(url,data);
    console.log(res)

}




getMemberDetails();