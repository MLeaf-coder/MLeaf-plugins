# cat-acg 🐱

[ 中文 ](./README_zh-CN.md)
The plugin library for cat-acg is constantly being adapted to make cat-acg even more perfect.

## Plugin List

| Plugin Name                                                                         | Plugin Description                           | Plugin Status    |
| :---------------------------------------------------------------------------------- | :------------------------------------------- | :--------------- |
| [Help](https://github.com/MLeaf-coder/MLeaf-plugins/tree/main/help)                 | Help command adapted with images             | [In Progress...] |
| [Pipixia Video Parsing](https://github.com/MLeaf-coder/MLeaf-plugins/tree/main/ppx) | Pipixia video parsing and watermark removal  | [Completed ✔]    |
| [kfc](https://github.com/MLeaf-coder/MLeaf-plugins/tree/main/kfc)                   | A fun plugin to generate kfc text and images | [Completed √]    |

---

## Plugin Development Standards

### **Ensure Default Export**

Plugins must default export asynchronously as shown in the example below:

```JavaScript
export default async (client) => {
  // Plugin code
};
```

### Reply Command Example

```JavaScript
// Import the logger module
import log from "#logger";
// Import the event module for receiving messages
import { NewMessage } from "telegram/events/index.js";

export default async (client) => {
  client.addEventHandler(async (event) => {
    // Wrap functions with try to prevent crashes on errors
    try {
      // Assign the received message to `message`
      const message = event.message;
      // Check if the message starts with `/`
      const command = message.message.split(" ")[0];
      // Get bot's information
      const me = await client.getMe();
      // Filter messages directed at other bots, only respond to its own
      const [cmd, username] = command.split("@");
      if (username && username.toLowerCase() !== me.username.toLowerCase()) {
        return;
      }
      // Handle `/start` message
      if (cmd === "/start") {
        await client.sendMessage(message.chat.id, {
          // Reply with a message
          message: "halo world",
        });
      }
    } catch (error) {
      // Log the error
      log.error(`[1] Error processing plugin message: ${error}`);
    }
  }, new NewMessage());
};
```

### Plugin Usage

Simply clone this project directly into the `plugins` directory of cat-acg.

The directory structure should be as follows:

```
plugins/
  plugin-repo/
    index.js (entry listener file)
```

### Notice

This repository is for personal learning purposes only. It is strictly for educational and exchange purposes. Do not use it for commercial purposes, as consequences are at your own risk.

If you have any good suggestions or gameplay, welcome to raise issues

![:name](https://count.getloli.com/@MLeaf-plugins?name=MLeaf-plugins&theme=rule34&padding=7&offset=0&align=center&scale=1&pixelated=1&darkmode=auto)
