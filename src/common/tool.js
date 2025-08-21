const tool={
  /**
   * 
   * @param {内容} str 
   * @param {长度} maxLength 
   */
  truncateString: function (str, maxLength) {
    if (str.length <= maxLength) {
      return str;
    }
    return str.slice(0, maxLength) + '...';
  }
}
export default tool;