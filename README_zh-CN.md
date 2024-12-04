# cat-acg 🐱

[ en ](./README.md)
cat-acg 的插件库，正在不断适配 cat-acg，让 cat-acg 变得更加完美。

## 插件列表

| 插件名称                                                                     | 插件描述                        | 插件状态     |
| :--------------------------------------------------------------------------- | :------------------------------ | :----------- |
| [帮助](https://github.com/MLeaf-coder/MLeaf-plugins/tree/main/help)          | 帮助命令已适配图像              | [适配中...]  |
| [皮皮虾视频解析](https://github.com/MLeaf-coder/MLeaf-plugins/tree/main/ppx) | 皮皮虾视频解析去水印解析        | [适配完成 ✔] |
| [kfc](https://github.com/MLeaf-coder/MLeaf-plugins/tree/main/kfc)            | 一款娱乐插件生成 kfc 文案加图像 | [适配完成 √] |

---

## 插件编写规范

### **注意默认导出**

插件必须默认导出 async 如以下示例

```JavaScript
export default async (client) => {
// 插件代码
};
```

### 回复命令示例

```JavaScript
// 导入日志模块
import log from "#logger";
// 导入接收消息事件模块
import { NewMessage } from "telegram/events/index.js";

export default async (client) => {
  client.addEventHandler(async (event) => {\
  // 使用try包裹函数，防止错误停机
    try {
      // 把获取的消息赋值给message
      const message = event.message;
      // 判断消息是否以/开头
      const command = message.message.split(" ")[0];
      // 获取机器人的信息
      const me = await client.getMe();
      // 过滤其他指定@的消息只回应自己的消息
      const [cmd, username] = command.split("@");
      if (username && username.toLowerCase() !== me.username.toLowerCase()) {
        return;
      }
      // 判断消息/start
      if (cmd === "/start") {
        await client.sendMessage(message.chat.id, {
            // 回复消息
          message: "halo world",
        });
      }
    } catch (error) {
        // 打印错误日志
      log.error(`[1]插件处理消息时出错: ${error}`);
    }
  }, new NewMessage());
};

```

### 插件使用

在 cat-acg 的 plugins 目录中直接克隆本项目即可

目录结构为

plugins/插件仓库/index.js 入口监听文件

### 注意

本仓库为个人学习项目，仅供学习交流使用，请勿用于商业用途，否则后果自负。

如果你有什么好的建议或者玩法欢迎提 issue

![:name](https://count.getloli.com/@MLeaf-plugins?name=MLeaf-plugins&theme=rule34&padding=7&offset=0&align=center&scale=1&pixelated=1&darkmode=auto)
