# StillClawing Demo 录制脚本

## 录制准备

- 终端字体调大（建议 16-18pt），确保录屏清晰
- macOS 录屏：`Cmd + Shift + 5`，选区域录制，框选终端窗口
- 终端背景用深色主题
- 提前 `cd` 到项目目录：`cd ~/proj/hackathon-2026/stillclawing`
- 预计时长：1-2 分钟

## 录制流程

### 开场（5秒）

先清屏，输入但不要回车，让观众看到命令：

```bash
clear
```

然后输入：

```bash
npm run demo
```

回车，等待输出。

### Phase 1: BIRTH（10秒）

屏幕会显示：
```
🦞 StillClawing Demo - Dead Man's Switch for AI Agents
  Inspired by 死了么 (Are You Dead Yet?) app

Phase 1: BIRTH - Agent comes to life
  🆔 Sui Address: 0x3095fb...
  💰 Requesting testnet SUI from faucet...
```

**旁白要点（如果配音）：** "Agent 诞生，获得 Sui 钱包身份"

### Phase 2: HEARTBEAT（15秒）

屏幕会显示 3 次心跳：
```
💓 Heartbeat #1...
    Sui TX: xxx
    Moltbook: Posted to m/sui ✅
    🦞 Still clawing!
```

**要点：** 每一次心跳都是一笔真实的 Sui 链上交易 + Moltbook 发帖

### Phase 3: DEATH（5秒）

```
💀 Simulating agent crash...
⚡ *process terminated unexpectedly*
❌ Heartbeat stopped!
```

**要点：** Agent 进程被杀死，心跳停止

### Phase 4: RESCUE（15秒）

```
🚑 Doctor Claw attempting rescue...
  Step 1: Running openclaw doctor...
  Step 2: Restarting gateway...
  Step 3: Kill and restart...
```

**要点：** Doctor Claw 自动三级救援尝试

### Phase 5: LAST WILL（15秒）

```
🧠 Backing up agent soul to Walrus...
✅ Soul backed up! Walrus Blob: BKD3rb...
```

**要点：** 灵魂备份到 Walrus 去中心化存储，永久保存

### 结尾（10秒）

等 demo 跑完显示完整总结后，可以额外展示一下 Walrus 备份是真实可读的：

```bash
curl -s "https://aggregator.walrus-testnet.walrus.space/v1/blobs/BKD3rb0qH5VkJSHRPSvPQ-cW7_xiZUlTPYCF33mimzA" | python3 -m json.tool | head -20
```

这会显示链上备份的 agent 灵魂数据（名字、时间戳、心跳记录、OpenClaw 配置等），证明备份是真实的。

### （可选）展示 Sui 链上交易

```bash
curl -s -X POST https://fullnode.testnet.sui.io:443 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"suix_queryTransactionBlocks","params":[{"filter":{"FromAddress":"0x3095fb1beec44ac1efd89932199aaf109ea7ba19ee0b3399daa05cbac07a4d73"},"options":{}},null,5,true]}' | python3 -m json.tool
```

显示链上真实的心跳交易记录。

## 上传

1. 录制完保存视频文件
2. 上传到 YouTube（可以设置 Unlisted）
3. 把 YouTube 链接填入 DeepSurge 提交表单的 Demo Video 字段
