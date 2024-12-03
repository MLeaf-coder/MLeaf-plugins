import fetch from "node-fetch";

// 定义一个解析视频链接的函数
export async function extractVideoUrls(userInput) {
  try {
    let itemId;

    // 检查输入的网址是否包含 "/s/"
    if (userInput.includes("/s/")) {
      // 发送 GET 请求到输入的网址
      const response = await fetch(userInput);
      if (response.ok) {
        // 从响应中获取重定向后的 URL
        const redirectedUrl = response.url;

        // 从新的 URL 中提取 "/item/" 后面的数字部分
        const match = redirectedUrl.match(/\/item\/(\d+)/);
        if (match) {
          itemId = match[1];
        } else {
          throw new Error("无法从重定向的 URL 中提取有效的数字部分");
        }
      } else {
        throw new Error(`请求失败，状态码: ${response.status}`);
      }
    } else {
      // 使用正则表达式提取数字部分
      const match = userInput.match(/\/item\/(\d+)/);
      if (match) {
        itemId = match[1];
      } else {
        throw new Error("无法从输入中提取有效的数字部分");
      }
    }

    const newUrl = `https://h5.pipix.com/bds/cell/cell_h5_comment/?cell_id=${itemId}&count=5&aid=1319&app_name=super`;

    // 发送 HTTP 请求并获取返回数据
    const response = await fetch(newUrl);
    if (!response.ok) {
      throw new Error(`请求失败，状态码: ${response.status}`);
    }

    const data = await response.json();
    let videoUrl = null;

    // 提取视频链接的递归函数
    const extractUrls = (obj) => {
      if (videoUrl) return; // 如果已经找到视频链接，直接返回
      if (typeof obj === "object" && obj !== null) {
        for (const key in obj) {
          const value = obj[key];
          if (
            key === "url" &&
            typeof value === "string" &&
            !value.endsWith(".jpeg") &&
            value.includes("video")
          ) {
            videoUrl = value;
            return;
          } else {
            extractUrls(value);
          }
        }
      } else if (Array.isArray(obj)) {
        obj.forEach((item) => extractUrls(item));
      }
    };

    // 调用递归函数提取视频链接
    extractUrls(data);

    return videoUrl ? [videoUrl] : ["未找到视频链接内容"];
  } catch (error) {
    return [`发生错误: ${error.message}`];
  }
}
