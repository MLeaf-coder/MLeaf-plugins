# FuyuBot

FuyuBot 的插件库，正在不断适配 FuyuBot，让 FuyuBot 变得更加完美。

## 插件列表

| 插件名称                                                                     | 插件描述                           | 插件状态      |
| :--------------------------------------------------------------------------- | :--------------------------------- | :------------ |
| [帮助](https://github.com/MLeaf-coder/MLeaf-plugins/tree/main/help)          | 帮助命令已适配图像(存档状态)       | [取消适配 ❌] |
| [皮皮虾视频解析](https://github.com/MLeaf-coder/MLeaf-plugins/tree/main/ppx) | 皮皮虾视频解析去水印解析           | [适配完成 ✔]  |
| [kfc](https://github.com/MLeaf-coder/MLeaf-plugins/tree/main/kfc)            | 一款娱乐插件生成 kfc 文案加图像    | [适配完成 ✔]  |
| [Gemini](https://github.com/MLeaf-coder/MLeaf-plugins/tree/main/Gemini)      | 对接 Gemini 使其机器人可以进行闲聊 | [适配完成 ✔]  |

---

# Gemini 使用

首先在安装插件后需要使用命令

```bash
npm install @google/generative-ai
```

进行安装依赖，由于 FuyuBot 目前暂未适配目录包识别导致无法直接在目录中使用对应包，所以需要手动安装依赖。其次你需要进入/Gemini/api/api.js 中配置你的 apikey 和对应模型

- 好像 v2 是支持的，期待一下吧

# Gemini 计划

- [✔] 适配对话
- [x] 适配情绪
- [x] 适配图片
- [x] 适配记忆
- [x] 适配角色

由于 [FuyuBot](https://github.com/CatMoeCircle/FuyuBot) 的插件调整，目前只需要拥有 FuyuBot 本体后启动 bot 发送

```bash
/plugins add 插件库连接
```

即可快速使用本项目插件

示例:

```bash
/plugins add https://github.com/MLeaf-coder/MLeaf-plugins.git
```

如果你有什么好的建议或者玩法欢迎提 issue

![:name](https://count.getloli.com/@MLeaf-plugins?name=MLeaf-plugins&theme=rule34&padding=7&offset=0&align=center&scale=1&pixelated=1&darkmode=auto)
