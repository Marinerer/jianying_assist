class LocalDataService {
  
  static load_user_data(){
    let user =  this.loadData('user_info');
    
    if(user){
      return user;
    }else{
      return null;
    }
  }


  static set_user_data(user_info){
    this.storeData('user_info', user_info);
  }
  
  // 获取剪映草稿路径
  static getDraftPath() {
    return this.loadData('draft_path');
  }

  // 写入剪映草稿路径
  static setDraftPath(path) {
    this.storeData('draft_path', path);
  }

  // 存储数据
  static storeData(key, data) {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);
    } catch (error) {
      console.error("Error saving data to localStorage", error);
    }
  }

  // 读取数据
  static loadData(key) {
    try {
      const serializedData = localStorage.getItem(key);
      if (serializedData === null) {
        return undefined;
      }
      return JSON.parse(serializedData);
    } catch (error) {
      console.error("Error loading data from localStorage", error);
      return undefined;
    }
  }

  // 删除数据
  static removeData(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Error removing data from localStorage", error);
    }
  }

    // 记录空间列表
    static setSpaceList(spaces) {
      this.storeData('space_list', spaces);
    }
  
    // 获取空间列表
    static getSpaceList() {
      return this.loadData('space_list') || [];
    }
  
    // 增加空间
    static addSpace(title, hash,url) {
      const spaces = this.getSpaceList();
      spaces.push({ title, hash ,url});
      this.setSpaceList(spaces);
    }
  
    // 删除空间
    static removeSpace(hash) {
      let spaces = this.getSpaceList();
      spaces = spaces.filter(space => space.hash !== hash);
      this.setSpaceList(spaces);
    }

    // Save cookies associated with a specific space
  static saveCookies(hash, cookies) {
    try {
      const key = `cookie_data_${hash}`; // Unique key for each space's cookies
      this.storeData(key, cookies);
    } catch (error) {
      console.error("Error saving cookies to localStorage", error);
    }
  }

  // Get cookies associated with a specific space
  static getCookies(hash) {
    try {
      const key = `cookie_data_${hash}`; // Unique key for each space's cookies
      return this.loadData(key);
    } catch (error) {
      console.error("Error loading cookies from localStorage", error);
      return null;
    }
  }

  // 保存是否自动打开草稿路径的设置
  static setAutoOpenDraft(isOpen) {
    this.storeData('auto_open_draft', isOpen);
  }

  // 获取是否自动打开草稿路径的设置
  static getAutoOpenDraft() {
    const value = this.loadData('auto_open_draft');
    // 如果没有设置过，默认返回 true
    return value === undefined ? true : value;
  }

  

}

module.exports = LocalDataService;