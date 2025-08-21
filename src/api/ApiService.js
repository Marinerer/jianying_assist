import { toast } from 'react-toastify';
import LocalDataService from './LocalDataService';
class ApiService {
  constructor() {
    this.apiBase = 'https://ts-api.fyshark.com/api'; // 服务器地址
    // 全局引用，用于存储userProfileRef
    this.userProfileRef = null;
  }

  // 设置userProfileRef的方法
  setUserProfileRef(ref) {
    this.userProfileRef = ref;
  }

  // 通用的请求方法
  async request (url, method, data) {
    const requestOptions = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify(data)
    };

    try {
      const response = await fetch(url, requestOptions);
      const responseData = await response.json();
      if (!response.ok) {
        throw { status: response.status, data: JSON.stringify(responseData) };
      }
      return responseData; // 返回解析后的JSON对象
    } catch (error) {
      // 检查是否是500错误（登录态失效）
      if (error && error.status === 500 && error.data.indexOf('token') != -1) {
        // 清除本地登录信息
        LocalDataService.set_user_data(null);
         
        
        // 显示错误提示
        toast.error('登录已过期，请重新登录');
      } else {
        // 其他错误，如果不是获取命令列表的请求，则显示错误提示
        
        toast.error(`请求错误：${error.data || JSON.stringify(error)}`);
        
      }
      
      throw error; // 将错误抛出，使得调用者能够处理它
    }
  }

  // 登录方法
  login (phone, password) {
    return this.request(`${this.apiBase}/login`, 'POST', { phone, password });
  }

  //验证码登陆
  login_message (phone, user_type, code_type, code) {
    return this.request(`${this.apiBase}/login_message`, 'POST', { phone, user_type, code_type, code });
  }

  // 注册方法
  register2 (name, phone, password, from_id, user_type, code_type, code) {
    return this.request(`${this.apiBase}/register2`, 'POST', { name, phone, password, from_id, user_type, code_type, code });
  }

  //文本检测
  text_check (token, text) {
    return this.request(`${this.apiBase}/text_check`, 'POST', { token, text });
  }

  //获取小说内容
  get_xiaoshuo_content (token, url) {
    return this.request(`${this.apiBase}/get_xiaoshuo_content`, 'POST', { token, url });
  }


  //获取用户信息
  get_user_info (token) {
    return this.request(`${this.apiBase}/user_info`, 'POST', { token });
  }

  //获取人脸
  get_face_info (image_base64) {
    return this.request(`${this.apiBase}/get_face_info`, 'POST', { image_base64 });
  }
  // 创建任务
  create_video_task (token, title, video_url, voice_name, from_lang, to_lang, video_sec, lang_type) {
    return this.request(`${this.apiBase}/create_video_task`, 'POST', { token, title, video_url, voice_name, from_lang, to_lang, video_sec, lang_type });
  }

  // 创建任务
  reset_video_task (token, video_id) {
    return this.request(`${this.apiBase}/reset_video_info`, 'POST', { token, video_id });
  }

  // 获取视频列表
  get_video_list (token, begin, count) {
    return this.request(`${this.apiBase}/get_video_task`, 'POST', { token, begin, count });
  }
  // 获取视频详情
  get_video_info (token, id) {
    return this.request(`${this.apiBase}/get_video_info_by_id`, 'POST', { token, video_id: parseInt(id) });
  }

  //创建文案提取任务
  create_video_to_text_task (token, user_type, mp3_url, video_url, douyin_url) {
    return this.request(`${this.apiBase}/create_video_to_text_task`, 'POST', { token, user_type, mp3_url, video_url, douyin_url });
  }

  get_video_to_text_task_list (token, user_type, begin, count) {
    return this.request(`${this.apiBase}/get_video_to_text_task_list`, 'POST', { token, user_type, begin, count });
  }

  get_audio_task_info (token, task_id) {
    return this.request(`${this.apiBase}/get_audio_task_info`, 'POST', { token, task_id });
  }

  // 
  create_audio_task (token, tts_type, locale, name, role, style, rate, pitch, source_text) {
    return this.request(`${this.apiBase}/create_audio_task`, 'POST', { token, tts_type, locale, name, role, style, rate, pitch, source_text });
  }
  // 获取发布账号列表
  get_video_user_list (token, begin, count) {
    return this.request(`${this.apiBase}/get_video_user_list`, 'POST', { token, begin, count });
  }
  // 获取发布任务的列表
  get_publish_tasks_list (token, begin, count) {
    return this.request(`${this.apiBase}/get_publish_tasks_list`, 'POST', { token, begin, count });
  }
  // 添加登录任务
  add_login_task (token, platform, account_name) {
    return this.request(`${this.apiBase}/add_login_task`, 'POST', { token, platform, account_name });
  }
  // 获取登录二维码和状态
  get_login_task_info (token, task_id) {
    return this.request(`${this.apiBase}/get_login_task_info`, 'POST', { token, task_id });
  }
  // 增加账号托管
  add_video_managed_account (token, account_name, platform, login_info) {
    return this.request(`${this.apiBase}/add_video_managed_account`, 'POST', { token, account_name, platform, login_info });
  }
  // 增加发布任务
  add_publish_task (token, account_ids, title, video_url, cover_image, publish_time) {
    return this.request(`${this.apiBase}/add_publish_task`, 'POST', { token, account_ids, title, video_url, cover_image, publish_time });
  }
  // 修改账号状态
  change_video_account_status (token, status, cid) {
    return this.request(`${this.apiBase}/change_video_account_status`, 'POST', { token, status, cid });
  }
  // 修改发布状态
  change_public_task_status (token, status, cid) {
    return this.request(`${this.apiBase}/change_public_task_status`, 'POST', { token, status, cid });
  }

  // 视频下载
  down_load_video (token, url) {
    return this.request(`${this.apiBase}/down_load_video`, 'POST', { token, url });
  }

  // dell3画图
  create_dall_task (token, prompt, image_width, image_height, quality, style) {
    return this.request(`${this.apiBase}/create_dall_task`, 'POST', { token, prompt, image_width, image_height, quality, style });
  }

  // 修改图片状态
  change_dall_task_by_id (token, task_id, status) {
    return this.request(`${this.apiBase}/change_dall_task_by_id`, 'POST', { token, task_id, status });
  }

  // 图片列表
  get_dall_tasks_list (token, begin, count) {
    return this.request(`${this.apiBase}/get_dall_tasks_list`, 'POST', { token, begin, count });
  }

  // 单图
  get_dall_task_by_id (token, task_id) {
    return this.request(`${this.apiBase}/get_dall_task_by_id`, 'POST', { token, task_id });
  }

  // 获取支付列表
  get_pay_info_list (token, shop_type) {
    return this.request(`${this.apiBase}/get_pay_info_list`, 'POST', { token, shop_type });
  }

  // 创建微信订单
  create_wx_order_info (token, shop_id) {
    return this.request(`${this.apiBase}/create_wx_order_info`, 'POST', { token, shop_id });
  }

  // 创建支付宝订单
  create_alipay_order_info (token, shop_id) {
    return this.request(`${this.apiBase}/create_alipay_order_info`, 'POST', { token, shop_id });
  }

  // 获取订单信息
  get_order_info (token, out_trade_no) {
    return this.request(`${this.apiBase}/get_order_info`, 'POST', { token, out_trade_no });
  }


  // 注销账号
  unregister (token) {
    return this.request(`${this.apiBase}/unregister`, 'POST', { token });
  }


  // 创建换脸任务
  create_face_task (data) {
    return this.request(`${this.apiBase}/create_face_task`, 'POST', data);
  }

  get_face_task_list (token, begin, count, task_type) {
    return this.request(`${this.apiBase}/get_face_task_list`, 'POST', { token, begin, count, task_type });
  }

  //获取风格
  get_style_list (token, begin = 0, end = 40) {
    return this.request(`${this.apiBase}/get_style_list`, 'POST', { token, begin, end });
  }

  //获取素材
  get_face_materials (token, begin, count, task_type) {
    return this.request(`${this.apiBase}/get_face_materials`, 'POST', { token, begin, count, task_type });
  }

  // 创建换脸任务
  create_video_gen_task (data) {
    return this.request(`${this.apiBase}/create_video_gen_task`, 'POST', data);
  }

  //更新字段
  book_detail_update (data) {
    return this.request(`${this.apiBase}/book_detail_update`, 'POST', data);
  }

  //生成文本内容
  book_generate_script (token, title, language, paragraph_number) {
    return this.request(`${this.apiBase}/book_generate_script`, 'POST', { token, title, language, paragraph_number });
  }

  //生成文本关键词
  book_generate_terms (token, title, content, amount) {
    return this.request(`${this.apiBase}/book_generate_terms`, 'POST', { token, title, content, amount });
  }

  //提交生成视频的任务
  text_gen_video (data) {
    return this.request(`${this.apiBase}/text_gen_video`, 'POST', data);
  }
  //获取视频列表
  get_text_gen_video_list (token, begin, count) {
    return this.request(`${this.apiBase}/get_text_gen_video_list`, 'POST', { token, begin, count });
  }

  get_video_gen_task_list (token, begin, count) {
    return this.request(`${this.apiBase}/get_video_gen_task_list`, 'POST', { token, begin, count });
  }

  //获取小说制作列表
  get_book_list (token, begin, count) {
    return this.request(`${this.apiBase}/get_book_list`, 'POST', { token, begin, count });
  }
  ///api/book_create
  //小说创建
  book_create (data) {
    return this.request(`${this.apiBase}/book_create`, 'POST', data);
  }

  //删除小说
  delete_book (token, book_id) {
    return this.request(`${this.apiBase}/delete_book`, 'POST', { token, book_id });
  }

  //获取小说制作详情
  get_book_detail_by_id (token, book_id, begin, count) {
    return this.request(`${this.apiBase}/get_book_detail_by_id`, 'POST', { token, book_id, begin, count });
  }

  get_promotion_income_info (token) {
    return this.request(`${this.apiBase}/get_promotion_income_info`, 'POST', { token });
  }

  get_invite_user_list (token, name, type_invite, begin, count) {
    return this.request(`${this.apiBase}/get_invite_user_list`, 'POST', { token, name, type_invite, begin, count });
  }

  apply_for_extract (token, alipay_account, name, money) {
    return this.request(`${this.apiBase}/apply_for_extract`, 'POST', { token, alipay_account, name, money });
  }
  //获取镜像列表
  get_docker_images_list (token, begin, count) {
    return this.request(`${this.apiBase}/get_docker_images_list`, 'POST', { token, begin, count });
  }

  //获取机器地区
  get_compute_region (token) {
    return this.request(`${this.apiBase}/get_compute_region`, 'POST', { token });
  }

  //获取机器地区库存
  get_compute_region_stock (token, region_sign) {
    return this.request(`${this.apiBase}/get_compute_region_stock`, 'POST', { token, region_sign });
  }

  //创建部署
  create_compute_deployment (token, region_sign, gpu_name_set, image_uuid) {
    return this.request(`${this.apiBase}/create_compute_deployment`, 'POST', { token, region_sign, gpu_name_set, image_uuid });
  }

  //获取容器
  get_compute_combined (token) {
    return this.request(`${this.apiBase}/get_compute_combined`, 'POST', { token });
  }

  //关闭容器
  close_compute_combined (token, deployment_uuid) {
    return this.request(`${this.apiBase}/close_compute_combined`, 'POST', { token, deployment_uuid });
  }

  //获取余额
  get_user_money (token) {
    return this.request(`${this.apiBase}/get_user_money`, 'POST', { token });
  }

  //获取用户金额明细
  get_user_money_detail (token, begin, count) {
    return this.request(`${this.apiBase}/get_user_money_detail`, 'POST', { token, begin, count });
  }
  //获取我的推广用户
  get_my_promote_user (token, user_type, page, page_size) {
    return this.request(`${this.apiBase}/get_my_promote_user`, 'POST', { token, user_type, page, page_size });
  }

  //获取洗视频列表
  get_change_video_task_list (token, begin, count) {
    return this.request(`${this.apiBase}/get_change_video_task_list`, 'POST', { token, begin, count });
  }
  //获取bgm
  get_audio_bgm_url (token) {
    return this.request(`${this.apiBase}/get_audio_bgm_url`, 'POST', { token });
  }

  //添加洗视频任务
  create_change_video_task (token, title, video_url, tts_name, tts_speed, sd_model, width, height, denoising_strength, check_type, img_pos, prompt, negative_prompt, bgm_url, is_change_text) {
    return this.request(`${this.apiBase}/create_change_video_task`, 'POST', { token, title, video_url, tts_name, tts_speed, sd_model, width, height, denoising_strength, check_type, img_pos, prompt, negative_prompt, bgm_url, is_change_text });
  }
  //获取洗视频详情
  get_change_video_task_by_id (token, video_id, begin, count) {
    return this.request(`${this.apiBase}/get_change_video_task_by_id`, 'POST', { token, video_id, begin, count });
  }

  //局部更新
  update_video_detail (token, video_id, _updates) {
    return this.request(`${this.apiBase}/update_video_detail`, 'POST', { token, video_id, updates: { ..._updates } });
  }

  //算力兑换码
  consume_activation_code (token, activation_code_info) {
    return this.request(`${this.apiBase}/consume_activation_code`, 'POST', { token, activation_code_info });
  }

  //获取验证码
  get_message_code (phone, user_type, code_type) {
    return this.request(`${this.apiBase}/get_message_code`, 'POST', { phone, user_type, code_type });
  }

  //创建合集
  create_batch_collection (token, title, input_list) {
    return this.request(`${this.apiBase}/create_batch_collection`, 'POST',
      {
        "token": token,
        "user_type": 1,
        "title": title,
        "input_list": input_list
      }
    );
  }

  get_batch_list (token, user_type, page, size) {
    return this.request(`${this.apiBase}/user_batch_collections`, 'POST', { token, user_type, page, size });
  }

  get_batch_collection (collection_id, page = 1, size = 200) {
    return this.request(`${this.apiBase}/get_batch_collection`, 'POST', { collection_id, page, size });
  }


  get_user_coze_token (token, user_type) {
    return this.request(`${this.apiBase}/get_user_coze_token`, 'POST', { token, user_type });
  }

  update_user_token (token, user_type, coze_token) {
    return this.request(`${this.apiBase}/update_user_token`, 'POST', { token, user_type, coze_token });

  }

  get_user_bot_list (token, user_type, page = 1, size = 20) {
    return this.request(`${this.apiBase}/get_user_bot_list`, 'POST', { token, user_type, page, size });
  }

  get_user_bot_by_id (token, user_type, bot_id) {
    return this.request(`${this.apiBase}/get_user_bot_by_id`, 'POST', { token, user_type, bot_id });
  }

  add_user_bot (token, user_type, title, bot_url) {
    return this.request(`${this.apiBase}/add_user_bot`, 'POST', { token, user_type, title, bot_url });
  }


  del_user_bot (token, user_type, bot_id) {
    return this.request(`${this.apiBase}/del_user_bot`, 'POST', { token, user_type, bot_id });
  }

  update_user_bot (token, user_type, title, bot_url, bot_id) {
    return this.request(`${this.apiBase}/update_user_bot`, 'POST', { token, user_type, title, bot_url, bot_id });
  }

  open_bot_status (token, user_type, bot_id, status) {
    return this.request(`${this.apiBase}/open_bot_status`, 'POST', { token, user_type, bot_id, status });

  }

  get_bot_cmds (token, user_type, bot_id) {
    return this.request(`${this.apiBase}/get_bot_cmds`, 'POST', { token, user_type, bot_id });
  }

  del_bot_cmd (token, user_type, cmd_id) {
    return this.request(`${this.apiBase}/del_bot_cmd`, 'POST', { token, user_type, cmd_id });
  }

  add_bot_cmd (token, user_type, title, cmd, bot_id) {
    return this.request(`${this.apiBase}/add_bot_cmd`, 'POST', { token, user_type, title, cmd, bot_id });
  }

  get_open_cmd_list (token, user_type) {
    return this.request(`${this.apiBase}/get_open_cmd_list`, 'POST', { token, user_type });
  }
  //获取插件列表
  get_plugins_list (token, user_type) {
    return this.request(`http://localhost:8020/api/plugins`, 'POST', { token, user_type });
  }

  get_api_token (token, user_type) {
    return this.request(`${this.apiBase}/get_api_token`, 'POST', { token, user_type });
  }

  //解析剪映草稿
  parse_jydraft (token, user_type, draft_url) {
    return this.request(`${this.apiBase}/parse_jydraft`, 'POST', { token, user_type, draft_url });
  }


  //获取剪映草稿记录
  get_jydraft_record (token, user_type, page = 1, page_size = 10) {
    return this.request(`${this.apiBase}/get_jydraft_record`, 'POST', { token, user_type, page, page_size });
  }

  //获取coze模板列表
  get_draft_template (page, page_size) {
    return this.request(`${this.apiBase}/get_draft_template`, 'POST', { page, page_size });
  }

  //获取coze模板列表
  consume_activation_code (token, user_type, activation_code_info) {
    return this.request(`${this.apiBase}/consume_activation_code`, 'POST', { token, user_type, activation_code_info });
  }

  //获取公众号登录链接
  get_qrcode () {
    return this.request(`${this.apiBase}/get_qrcode`, 'GET');
  }

  //获取公众号登录链接
  check_qrcode_status (scene_id) {
    return this.request(`${this.apiBase}/check_qrcode_status`, 'POST', { scene_id, from_user_id:0 });
  }

  //更新api_token
  reset_api_token (token) {
    return this.request(`${this.apiBase}/reset_api_token`, 'POST', { token });
  }

  //获取首页数据
  get_assistant_home_content(token) {
    return this.request(`${this.apiBase}/get_assistant_home_content`, 'POST', { token });
  }


}

export default ApiService;
