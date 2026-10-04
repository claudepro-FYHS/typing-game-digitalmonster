# Digi Monster Typer 数码怪兽击字（中文说明）

一个用 **Q 版数码宝贝**（动画第一到第三代）做的英文打字游戏。每个学生都有一只**伙伴数码兽**，打出敌人身上的英文单字就能攻击、打倒它们——打得好，伙伴还会**进化**成究极体！每一关最后有巨大的 Boss。
可以单人玩，也可以 2–4 人连线对战抢分。

- **游戏网址：** https://claudepro-fyhs.github.io/typing-game-digitalmonster/
- **排行榜：** 游戏上方的 **LEADERBOARD**
- **老师后台：** 游戏上方的 **TEACHER**（密码在 Google Sheet 里设定）

> English version: [README.md](README.md)

---

## 文件说明

| 文件 | 用途 | 老师需要改吗？ |
|---|---|---|
| `index.html` | 游戏网页（画面、排行榜、老师后台） | 不用 |
| `config.js` | 贴 Apps Script 网址 | **第一次设置时贴一次** |
| `words.js` | 词库（11 个词库，约 2800 个单字，包括新的 **Digital World & Monsters** 数码世界词库） | 想加单字时才改（见下面） |
| `meanings.js` | 打倒怪兽时显示的中文释义 | 想帮新单字加中文意思时才改 |
| `apps-script/Code.gs` | 贴进 Google Apps Script 的接收端程序 | 不用（照步骤复制贴上） |
| `models.js` | 数码兽名单和动作：15 只伙伴（各有究极体）加 13 位皇家骑士、13 种敌人、15 个 Boss 加 17 个节日 Boss | 不用 |
| `art/` | 数码兽的图（每只一个 SVG 文件，由 `tools/art/` 生成） | 不用 |
| `js/` | 游戏程序（单人、多人连线、等级与徽章、排行榜、老师后台） | 不用 |
| `lib/` | Three.js（3D 引擎）、PeerJS（多人连线），都是 MIT 授权 | 不用 |
| `tests/` | 自动测试（接收端和网页） | 不用 |
| `CLAUDE.md` | 开发说明（英文）：程序结构、怎么跑测试、怎么用这个游戏改出新游戏 | 不用 |

---

## 第一次设置（照顺序做，约 30 分钟）

### 步骤 A：Google Cloud Client ID（让学生可以用学校账号登入）

> 用**学校账号**登入来做。

1. 打开 https://console.cloud.google.com/，左上角按项目选择框，然后按 **NEW PROJECT**。
   - 名字填 `digi-monster-typer`，按 **CREATE**，建好后 **SELECT PROJECT**。
   - （如果之前已经为 `https://claudepro-fyhs.github.io` 上的另一个打字游戏做过 Client ID，可以直接沿用，跳过步骤 A。）
2. 在顶部搜索栏搜 **Google Auth Platform**，按 **Get started**：
   - App name 填 `Digi Monster Typer`
   - Support email 选您的邮箱
   - Audience 选 **External**（让学生的私人 Google 账号也能登入；如果只想让学校账号玩，选 **Internal**）
   - Contact email 填您的邮箱
   - 打勾同意后按 **Create**
3. 左边选 **Clients**，按 **+ Create client**：
   - Application type 选 **Web application**
   - **Authorized JavaScript origins** 按 **+ Add URI**，填 `https://claudepro-fyhs.github.io`
   - 按 **Create**
4. 复制画面上的 **Client ID**（格式像 `xxxx.apps.googleusercontent.com`），步骤 B 会用到。

### 步骤 B：建立 Google Sheet 和 Apps Script（收成绩的地方）

1. 到 Google Drive，按 **新增 → Google 试算表**，命名为 `Digi Monster Typer 成绩`。请用**新的**试算表，不要和别的游戏共用。
2. 在试算表上方选单按 **扩充功能（Extensions）→ Apps Script**。
3. 在新开的 Apps Script 页面：
   1. 把 `Code.gs` 里面原本的内容**全部删掉**。
   2. 打开 https://github.com/claudepro-FYHS/typing-game-digitalmonster/blob/main/apps-script/Code.gs，按右上角的 **Copy raw file** 图示（两个方块），这样就复制了全部内容。
   3. 回到 Apps Script 页面，贴上。
   4. 按 💾（Save）保存。
4. 在上方工具列的函数选单（在「Debug」旁边）选 **setup**，然后按 **▶ Run**。
5. 第一次运行会跳出授权窗口：
   1. 按 **Review permissions**，然后选您的学校账号。
   2. 如果看到「Google hasn't verified this app」，按 **Advanced**，再按 **Go to … (unsafe)**。这是您自己写的程序，所以没有问题。
   3. 按 **Allow**。
   4. 下方执行记录出现 `Setup done. 设置完成！` 就成功了。
6. 回到试算表，会看到多了 **Scores、Players、Settings、BannedWords、Admins、CoinGifts、Events** 七个分页。在 **Settings** 分页改 B 栏：
   - **ClassCounts**：每个年段有几班，例如 `J1:12, J2:12, J3:12, S1AC:4, S1S:6, S2AC:4, S2S:6, S3AC:4, S3S:6`。**请改成学校真实的班数。**学生会先选年段，再选班号。
   - **AllowOtherAccounts**：`YES` = 校外的 Google 账号也能玩（见下面「校外玩家」）；`NO` = 只限学校账号。
   - **TeacherPassword**：老师后台密码。**一定要改掉**默认的 `change-me-2026`。
   - **GoogleClientId**：贴上步骤 A 复制的 Client ID
7. 发布成网页应用：回到 Apps Script 页面，按右上角 **部署（Deploy）→ 新增部署作业（New deployment）**。
   1. 按「选取类型」旁边的 ⚙ 齿轮，选 **网页应用程式（Web app）**。
   2. 说明：填 `v1`
   3. 执行身分（Execute as）：选 **我（Me）**
   4. 谁可以存取（Who has access）：选 **所有人（Anyone）**
   5. 按 **部署（Deploy）**，复制 **网页应用程式网址**（结尾是 `/exec`）。

> ❗ 如果「谁可以存取」没有 **所有人（Anyone）** 这个选项，只有「foonyew.edu.my 内的所有人」，那是学校管理员锁住了。
> 选了「foonyew.edu.my 内的所有人」的话，游戏网页会连不上。请学校 IT 开放，或者告诉我改用别的方法。

### 步骤 C：把网址贴进 `config.js`

1. 打开 https://github.com/claudepro-FYHS/typing-game-digitalmonster/blob/main/config.js
2. 按右上角的 ✏️（Edit this file）。
3. 把步骤 B-7 的网址贴在 `APPS_SCRIPT_URL: ""` 的**两个引号中间**，例如：
   ```js
   APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycb.../exec",
   ```
4. 按右上角绿色的 **Commit changes…**，再按一次 **Commit changes**。

### 步骤 D：开启 GitHub Pages（让网址可以打开）

1. 打开 https://github.com/claudepro-FYHS/typing-game-digitalmonster/settings/pages
2. **Source** 选 **Deploy from a branch**。
3. **Branch** 选 **main**，资料夹选 **/ (root)**，按 **Save**。
4. 等 1–3 分钟，打开 https://claudepro-fyhs.github.io/typing-game-digitalmonster/ 就能玩了。
   - 之后每次改 `config.js`，也要等 1–3 分钟才会更新。

### 步骤 E：测试

1. 打开游戏网址，按 **Sign in with Google**，用学校账号登入。
2. 填好班级、座号、名字、花名。
3. 玩一局，至少 20 秒。
4. 结果画面出现 **✔ Saved to your class record**，Google Sheet 的 **Scores** 分页就会多一行成绩。
5. 按上方 **TEACHER**，输入密码，确认老师后台看得到数据。

---

## 以后怎么改设定

全部都在 Google Sheet 里改，**不用碰 GitHub**。改完学生重新整理网页就生效。

| 想改什么 | 去哪里改 |
|---|---|
| 每个年段的班数 | **Settings** 分页 → `ClassCounts`，例如 `J1:12, S2AC:4` |
| 开放／关闭校外 Google 账号 | **Settings** 分页 → `AllowOtherAccounts`（`YES` / `NO`） |
| 提早或延后换新学年 | **Settings** 分页 → `SchoolYear`（见下面） |
| 老师后台密码 | **Settings** 分页 → `TeacherPassword` |
| 排行榜最低准确率 | **Settings** 分页 → `LeaderboardMinAccuracy`（默认 80） |
| 学生的不当花名 | **Players** 分页 → 直接改 `Nickname` 那一格 |
| 加屏蔽词 | **BannedWords** 分页 → A 栏每行加一个字 |
| 学生填错班级或名字 | **Players** 分页直接改。之后的新成绩会用新资料；已经记录的旧成绩要在 **Scores** 分页自己改 |
| 删除测试成绩 | **Scores** 分页整行删掉 |
| 设定管理员 | **Admins** 分页 → A 栏填 email，B 栏填 `YES`（见下面） |
| 送金币给学生 | **CoinGifts** 分页（见下面） |
| 直接改某个学生的金币 | **Players** 分页 → 改 `Coins` 那一格 |
| 关掉某个节日 | **Settings** 分页 → `DisabledEvents`（见下面） |
| 校庆日期 | **Events** 分页（见下面） |

### 管理员（Admins 分页）

- 在 A 栏填 email（例如您自己的 `xxx@foonyew.edu.my`），B 栏填 `YES`。
- 管理员的金币显示为 **∞**，28 只伙伴全部可以直接使用。
- 管理员的成绩会记录在 Scores 分页，但**不会出现在排行榜和老师后台**，不会影响学生的数据。
- 管理员填资料时，班级可以选 **STAFF**。
- 想取消管理员：把 B 栏改成 `NO`，或者删掉那一行。

### 送金币（CoinGifts 分页）

每一行是一份礼物：

| A 栏：送给谁 | B 栏：金币数量 | C 栏：备注（随意） | D 栏：自动产生，不要改 |
|---|---|---|---|
| `amy@foonyew.edu.my` | 200 | 比赛冠军 | |
| `J105` | 50 | J105 全班奖励 | |
| `S2` | 30 | 全部高二班级（S2AC 和 S2S） | |
| `ALL` | 100 | 学校假期礼物 | |

- A 栏可以填一个学生的 email、一个班级（例如 `J105`）、一个年段（`J1`、`S2`、`S2AC`……），或 `ALL`（全部学校学生，不包括校外玩家）。
- 每份礼物，每个学生只会收到一次。学生下次打开游戏时会看到「🎁 Your teacher sent you … coins!」。
- B 栏填负数可以扣金币（最低扣到 0）。

### 节日活动（自动）

游戏内建 **18 个节日活动**，会自己按日期开启，老师不用填日期。

| 节日 | ID | 日期（马来西亚时间） | 节日 Boss |
|---|---|---|---|
| 🧧 农历新年 | `cny` | **整个 1 月和 2 月** | 苍龙兽 Azulongmon |
| 🏮 元宵节 | `lantern` | 正月十五，前后 7 天 | 朱雀兽 Zhuqiaomon |
| 🌿 清明节 | `qingming` | 约 4 月 4–5 日，前后 7 天 | （没有特别 Boss，用普通 Boss） |
| 🐉 端午节 | `dragonboat` | 五月初五，前后 7 天 | 巨型海龙兽 MegaSeadramon |
| 🌌 七夕 | `qixi` | 七月初七，前后 7 天 | 金鸡兽 Sinduramon |
| 🥮 中秋节 | `midautumn` | 八月十五，前后 7 天 | 安提拉兽 Antylamon |
| ⛰️ 重阳节 | `doubleninth` | 九月初九，前后 7 天 | 玄武兽 Ebonwumon |
| 🍡 冬至 | `solstice` | 约 12 月 21–22 日，前后 7 天 | 冰恶魔兽 IceDevimon |
| 🎆 元旦 | `newyear` | 1 月 1 日，前后 7 天 | 暗黑兽 Diaboromon |
| 💝 情人节 | `valentine` | 2 月 14 日，前后 7 天 | 女恶魔兽 LadyDevimon |
| 🤡 愚人节 | `aprilfools` | 4 月 1 日，前后 7 天 | 悟空兽 Etemon |
| 🥚 复活节 | `easter` | 复活节星期日，前后 7 天 | 蛋蛋兽 Digitamamon |
| 💐 母亲节 | `mothersday` | 5 月第 2 个星期日，前后 7 天 | 母体 D-Reaper |
| 👔 父亲节 | `fathersday` | 6 月第 3 个星期日，前后 7 天 | 狮子兽 Leomon |
| 🎃 万圣节 | `halloween` | 10 月 31 日，前后 7 天 | 南瓜兽 Pumpkinmon |
| 🎄 圣诞节 | `christmas` | 12 月 25 日，前后 7 天 | 樱桃兽 Cherrymon |
| 🌺 国庆日 | `merdeka` | 8 月 31 日，前后 7 天 | 鹦鹉兽 Parrotmon |
| 🎓 校庆 | `anniversary` | **老师在 Events 分页填日期** | 白虎兽 Baihumon |

- 每个节日从**节日前一个礼拜到节日后一个礼拜**（农历新年是整个 1 月和 2 月）。
- **节日重叠时**：当天就是节日的那个优先；不然**比较短的活动优先**（所以情人节、元宵节在新年两个月里面也会出现）。
- 西方节日和国庆日每年自动重复。农历节日的日期已经内建到 **2026–2030 年**；2031 年以后，在 **Events** 分页加行（见下面），或请人把 `js/calendar.js` 里的表格延长。
- 活动期间：会显示活动横幅，词库清单多一个**节日词库**；第 1、3、5…… 关出现节日 Boss；天空有节日装饰（灯笼、烟花、下雪、南瓜……）；**金币 ×1.5**。
- 选了节日词库，怪兽、Boss 和攻击光球上**只会出现节日单字**（每个节日约 60 个，都有中文意思）。选别的词库的学生，一样会遇到节日 Boss、装饰和 ×1.5 金币。
- 愚人节特别玩法：打倒的病毒怪兽有时会「复活」，并出现 🤡 APRIL FOOL! 字样（分数照样算）。
- 在活动期间玩游戏，可以获得 **🏮 Festival Hero** 徽章。

**关掉某个节日**：在 **Settings** 分页的 `DisabledEvents` 填上节日 ID，用逗号分隔，例如 `halloween, aprilfools`。留空 = 全部节日都开。

**Events 分页**（只用来补充日期）：

| A 栏：节日 ID | B 栏：开始 | C 栏：结束 | D 栏：备注 |
|---|---|---|---|
| `anniversary` | 2026-11-01 | 2026-11-07 | 校庆 |
| `midautumn` | 2031-09-24 | 2031-10-08 | （例子：2030 年以后的农历节日） |

- 日期用马来西亚时间，格式是 `YYYY-MM-DD`。
- 校庆一定要在这里填日期才会开启，每年记得更新。

### 加单字（words.js）

1. 在 GitHub 打开 `words.js`，按 ✏️ 编辑。
2. 在对应的词库里，把新单字加进引号里，用空格隔开。只能用英文字母 a–z，重复的字会自动去掉。
3. 按 **Commit changes** 保存，1–3 分钟后生效。
4. 可以顺便在 `meanings.js` 加上这个字的中文意思（一行一个：`英文 中文`），这样打倒怪兽时就会显示释义。

> 只有在 `Code.gs` 程序本身有更新时，才需要重新部署：
> 1. 贴上新的程序，按保存。在函数选单选 **setup**，按 **▶ Run** 一次（会补上新的分页和栏位，不会删除资料）。
> 2. 按 **部署 → 管理部署作业**，按 ✏️。
> 3. 「版本」选 **新版本**，按 **部署**。
>
> 这样网址不会变，不用改 `config.js`。

---

## 游戏说明（给学生）

- 打出病毒怪兽身上的单字就会锁定并攻击，整个字打完就能打倒它。
- 病毒撞到自己会扣 1 ♥，♥ 扣完游戏就结束。每打倒一个 Boss 会补回 1 ♥。
- 按键：
  - `Backspace`：放弃目前锁定的目标
  - `Esc`：暂停
  - `1`：💣 清屏
  - `2`：❄️ 冻结病毒 5 秒
  - `3`：🛡️ 护盾（挡一次攻击）
- **进化**：很多伙伴有**必杀技**：连续打对几个字后按 `Space` 发动（画面下方 🧬 会显示进度），伙伴会**进化**成更大的形态并攻击。另外，连续打对 **20 个字**伙伴就会进化，直到**打错 3 次**才变回成长期（只是外观）。每只伙伴都有自己的招式：有的发射火球或光束，有的会飞到敌人面前近身攻击再飞回来（奥米加兽会随机使出加鲁鲁炮或暴龙剑）。13 位**皇家骑士**本来就是究极体，不会进化：连击到 25、50、100 字时改送一个道具。
- 伙伴只是玩法不同，没有「越贵越强」：
  - 血量都在 4–6 ♥ 之间
  - 血多的伙伴金币收入较少
  - 金币只能买伙伴和颜色，不能买道具
- 伙伴是《数码宝贝大冒险》《02》《驯兽师之王》的 15 只主角数码兽；战斗时伙伴站在左边，敌人从右上方过来。所有图都是同人 Q 版画，只供课堂使用（数码宝贝的版权属于 Bandai / 东映动画）：

| 伙伴 → 究极体 | 类型 | 价钱 | ♥ | 特点 |
|---|---|---|---|---|
| 亚古兽 Agumon → 战斗暴龙兽 WarGreymon | 疫苗 · 爬虫 | 免费 | 5 | 平衡型，每关开始自带护盾 |
| 加布兽 Gabumon → 钢铁加鲁鲁 MetalGarurumon | 数据 · 爬虫 | 300 | 4 | 金币 +20% |
| 巴鲁兽 Palmon → 蔷薇兽 Rosemon | 数据 · 植物 | 300 | 5 | 道具掉率 ×1.6，金币 −10% |
| 甲虫兽 Tentomon → 大力甲虫兽 HerculesKabuterimon | 疫苗 · 昆虫 | 400 | 5 | 必杀：连续 3 字 → 打倒最近 1 个目标 |
| 比丘兽 Biyomon → 凤凰兽 Phoenixmon | 疫苗 · 鸟 | 400 | 4 | Boss 攻击慢 25%，金币 +10% |
| 哥玛兽 Gomamon → 维京兽 Vikemon | 疫苗 · 海兽 | 600 | 5 | 必杀：连续 5 字 → 冻结病毒 4 秒 |
| 犰狳兽 Armadillomon → 赤铜兽 Shakkoumon | 自由 · 哺乳 | 600 | 6 | 必杀：连续 6 字 → 打倒 2 个目标，金币 −20% |
| 迪路兽 Gatomon → 奥法尼兽 Ophanimon | 疫苗 · 圣兽 | 800 | 4 | 必杀：连续 5 字 → 病毒减速一半 6 秒 |
| 狗狗兽 Terriermon → 究极加尔古兽 MegaGargomon | 疫苗 · 兽 | 900 | 5 | 必杀：连续 8 字 → 打倒 5 个目标 |
| 巴达兽 Patamon → 炽天使兽 Seraphimon | 数据 · 哺乳 | 900 | 5 | 必杀：连续 5 字 → 获得护盾 |
| 小V兽 Veemon → 帝皇龙甲兽 Imperialdramon | 自由 · 龙 | 1000 | 5 | 金币 +10%；必杀：连续 3 字 → 打倒最近 1 个 |
| 妖狐兽 Renamon → 沙古牙兽 Sakuyamon | 数据 · 兽 | 1000 | 5 | 必杀：连续 6 字 → 病毒减速 8 秒 |
| 基尔兽 Guilmon → 红莲骑士兽 Gallantmon | 病毒 · 爬虫 | 1100 | 5 | 必杀：连续 7 字 → 打倒 4 个目标 |
| 小虫兽 Wormmon → 大锹形虫兽 GrandisKuwagamon | 自由 · 昆虫 | 1100 | 5 | 必杀：连续 6 字 → 冻结 6 秒，道具 ×1.2 |
| 鹰兽 Hawkmon → 瓦尔多兽 Valdurmon | 数据 · 鸟 | 1200 | 4 | 必杀：连续 5 字 → 打倒 3 个目标 |

**皇家骑士**（本来就是究极体，不会进化；连击到 25、50、100 字时各送一个符合角色的道具，最多 3 个）：

| 皇家骑士 | 价钱 | ♥ | 必杀 | 连击道具 |
|---|---|---|---|---|
| 奥米加兽 Omnimon | 3000 | 5 | 连续 6 字 → 打倒 4 个目标 | 💣 |
| 阿尔法兽 Alphamon | 2800 | 5 | 连续 5 字 → 打倒 3 个目标 | 💣 |
| 红莲骑士兽（真红模式）Gallantmon CM | 2500 | 5 | 连续 5 字 → 护盾 | 🛡️ |
| 马格纳兽 Magnamon | 2500 | 6 | 连续 6 字 → 护盾 | 🛡️ |
| 究极V龙兽 UlforceVeedramon | 2500 | 4 | 连续 5 字 → 病毒减速 8 秒 | ❄️ |
| 帝皇龙骑兽 Examon | 2500 | 6 | 连续 8 字 → 打倒 5 个目标 | 💣 |
| 天马骑士兽 Craniamon | 2200 | 6 | 连续 6 字 → 护盾 | 🛡️ |
| 龙帝兽 Dynasmon | 2000 | 5 | 连续 4 字 → 打倒 2 个目标 | 💣 |
| 公爵兽 Crusadermon | 2000 | 4 | 连续 6 字 → 冻结 6 秒 | ❄️ |
| 斯雷普尼尔兽 Sleipmon | 2000 | 5 | 连续 6 字 → 冻结 6 秒 | ❄️ |
| 杰斯兽 Jesmon | 2000 | 5 | 连续 5 字 → 打倒 3 个目标 | 💣 |
| 豹骑兽 Leopardmon | 1800 | 5 | 连续 6 字 → 病毒减速 8 秒 | ❄️ |
| 岩钢兽 Gankoomon | 1800 | 6 | 连续 2 字 → 打倒最近 1 个 | 💣 |

- **敌人**：短字是 Numemon、DemiDevimon、Gazimon、Bakemon；中字是 Goblimon、Meramon、Snimon、Kuwagamon；长字是 Ogremon、Monochromon、DarkTyrannomon、Golemon、Seadramon。
- **Boss**（按这个顺序解锁）：恶魔兽 Devimon、钢铁悟空兽 MetalEtemon、吸血魔兽 Myotismon、奇美拉兽 Kimeramon、魔王兽 Daemon、黑暗四天王（钢铁海龙兽、木偶兽、机械邪龙兽、小丑皇）、毒蛇吸血魔兽 VenomMyotismon、黑色战斗暴龙兽 BlackWarGreymon、别西卜兽 Beelzemon、魔龙兽 Megidramon、魔王吸血魔兽 MaloMyotismon、阿波卡利兽 Apocalymon。

### 等级、徽章、颜色和战场

- **驯兽师（Tamer）等级**：每场战斗都会获得 XP（打倒病毒、Boss、关卡和打字速度都算），最高 50 级。
  - 每升一级多解锁一个 **Boss**：LV 1 有 5 个，LV 11 全部 15 个解锁。
  - 升级也会解锁新**战场**：数据平原（LV 1）、像素海滩（LV 3）、故障森林（LV 6）、字节沙漠（LV 10）、霓虹城市（LV 15）、黑暗网络（LV 20）。
- **徽章**：共 19 个，例如 *Combo Master*（连续 50 字）、*Dedicated*（一周玩 5 天）、*Mega Evolution*（80 WPM）、*Avenger*（打倒 20 个复仇病毒）。在基地按 **🏅 BADGES** 可以看全部徽章。
- **称号**：把获得的徽章设为称号，会显示在排行榜的花名旁边。
- **颜色**：基地的 🎨 **COLORS** 分页可以买 7 种换色（Sand Data、Ice Data、Sakura、Virus Black、Neon Cyber、Golden Shine、Ghost Data），所有拥有的伙伴都能用。

### 好玩的小功能

- **背景音乐**：原创的动画片头曲风格歌曲（摇滚鼓、律动贝斯、吉他和弦、大合唱般的副歌），连击越高节奏越快。可在基地关掉音乐。
- **连击特效**：连续打对 10、25、50、100 字时，画面跳出大大的 **COMBO**，伙伴脚下出现光环，画面边缘亮起，背景音乐也会加速；到 20 字伙伴会进化（皇家骑士改在 25、50、100 字送道具）。
- **最后一击**：打倒 Boss 的瞬间进入慢动作，镜头冲向 Boss，然后大爆炸。
- **错字复仇战**：打错的字会在下一次单人游戏变成金色 ⭐ 精英病毒，打倒可得**双倍分数和金币**。打倒后，这个字就会从复仇名单移除。
- **中文释义**：打倒怪兽时会跳出那个字的中文意思，可以在基地按 **中文** 按钮关掉。结算画面的错字也会显示中文。
- **分享卡**：结算画面按 **📸 SHARE CARD**，会生成一张包含伙伴和它的进化形态、WPM、准确率、连击、等级和称号的图片，可以储存或分享。
- **背景音乐**：内建简单的 8-bit 配乐，可以按 **MUSIC** 按钮关掉。

### 多人连线（2–4 人）

1. 每个人都要用**学校账号登入**。
2. 一个人在基地按 **👥 MULTIPLAYER → CREATE ROOM**，画面会出现 5 个字的**房间号**。
   - 难度和词库用这个人基地里的设定。
   - 可以选 3 关、5 关，或无限关。
3. 其他人按 **👥 MULTIPLAYER**，输入房间号，按 **JOIN**。
   - 也可以由开房的人按 **COPY INVITE LINK**，把邀请连结贴到班级群组，同学点连结、登入后就会自动进房。
4. 人到齐后，开房的人按 **START MATCH**。

**玩法**
- 大家在同一个战场，每个人都可以打任何一只病毒，**谁先打完那个字，分数就归谁**（「抢射」）。
- 病毒会**平均攻击每一位玩家**。标签左边的颜色代表它正在冲向谁，红框代表冲向你。所以要有策略：先保护自己，还是去抢别人的分数？
- 标签下方的彩色小条，显示其他人打到哪里了。
- 道具和必杀技只影响「冲向你的病毒」。
- 伙伴倒下的玩家会变成观战，其他人继续。最后按分数排名。
- 多人模式的成绩会记录给老师（Scores 分页的 Mode 栏写 `Multi`），但**不上排行榜**，因为被抢分会让 WPM 变低，这样对单人排行榜才公平。

---

## 成绩怎么算

- **WPM**：打对的字母数 ÷ 5 ÷ 实际作战分钟数。关卡开场动画和过关画面不算在时间内。
- **准确率**：打对的按键数 ÷ 全部按键数。
- **坚持时间**：从开始到结束的秒数，暂停的时间不算。
- 玩不到 20 秒或按键少于 20 下的局，不会记录。
- 单字以「抽牌」方式出现：整个词库轮完一遍之前，同一个字不会重复出现。

**排行榜**
- **⚔️ 班级对抗赛**：本周每打倒一只病毒（单人和多人都算），就替自己的班级加 1 分。各班按总数排名，分 **初中**（J1–J3）、**高中**（S1–S3）、**全校** 三个榜，各自显示上周冠军班级。
- 每个难度分开排，分「本周」和「全部时间」两个榜。
- 以 WPM 排名，准确率要达到 80% 以上才会上榜。
- 只算单人模式，管理员不列入。
- 每个学生只列最佳的一次，只显示花名、等级和所选的称号。
- 「本周」按马来西亚时间计算，从星期一 00:00 开始。

**老师后台**
- 每班平均速度
- 每位学生的最佳成绩和进步幅度（最近 3 局平均 − 最早 3 局平均）
- 各班最常打错的 20 个单字

---

## 班级、新学年和校外玩家

**班级**：学生先选**年段**（J1、J2、J3、S1AC、S1S、S2AC、S2S、S3AC、S3S），再选**班号**。班级会这样储存：
- 初中班号补成两位数：J1 第 5 班 → **`J105`**，J3 第 11 班 → **`J311`**
- 高中不补：S2AC 第 3 班 → **`S2AC3`**，S1S 第 6 班 → **`S1S6`**

年段和每个年段的班数，都在 **Settings** 分页的 `ClassCounts` 设定。以后多了新的年段，直接加上去就可以（例如 `S1X:2`）。

**新学年**：每年 **1 月 1 日**起，学生下次登入时会被要求重新选班级和座号。金币、伙伴、等级和徽章都会保留；旧成绩保留当时的班级。如果学校换学年的日子不是 1 月 1 日，可以在想换的那天把年份填进 `SchoolYear`（例如填 `2027`）；留空就是每年 1 月 1 日自动换。

**校外玩家**（`AllowOtherAccounts` = `YES`）：
- 任何 Google 账号（例如 Gmail）都可以登入，金币、伙伴、等级、徽章都会像学生一样保存。
- 他们只需要填花名（名字可以不填），不用选班级和座号。在 Players 和 Scores 分页，他们的班级是 **`OTHER`**。
- 他们会出现在排行榜上，花名旁边有 🌐。他们**不列入**班级对抗赛；在老师后台归在 `OTHER`。
- 要让校外账号能登入，Google Cloud 的登入设定必须是 **External**（步骤 A）。如果之前选了 **Internal**：打开 https://console.cloud.google.com/ → **Google Auth Platform → Audience（目标对象）** → 按 **Make external（设为外部）**，再确认发布状态是 **In production（正式版）**（如果显示 *Testing*，按 **Publish app**）。游戏只读取名字和邮箱，所以 Google 不需要审核。
- 随时可以把 `AllowOtherAccounts` 改成 `NO`：校外玩家就不能再登入，也会从排行榜消失（资料仍保留在试算表里）。

---

## 隐私与安全

- 老师密码只存在您的 Google Sheet 里，由 Apps Script 检查，**不在公开的网页代码里**。
- 排行榜只送出花名、WPM、准确率和日期，**不会送出真实姓名或邮箱**。
- 玩家登入时，Apps Script 会向 Google 核对登入凭证，所以别人就算知道接收网址，也没办法冒充别人交成绩。只有 `@foonyew.edu.my` 账号可以选班级；其他 Google 账号只有在 `AllowOtherAccounts` 是 `YES` 时才接受。
- 学生的登入状态只保存在当前的浏览器分页，关掉浏览器就会自动登出。学校电脑是共用的，还是请提醒学生玩完按 **Sign out**。
- 如果成绩送出失败（例如网络断线），游戏照常显示成绩，并把成绩暂存在这台电脑。12 小时内下次打开游戏时会自动补送。

---

## 常见问题

**学生看到 "Can't reach the school server"**
- 请检查步骤 B-7 的「谁可以存取」是不是 **所有人（Anyone）**。
- 也请检查 `config.js` 里的网址是否完整，结尾要是 `/exec`。

**登入按钮没有出现**
- 请检查 Settings 分页的 `GoogleClientId` 有没有填。
- 请检查步骤 A 的 Authorized JavaScript origins 是不是 `https://claudepro-fyhs.github.io`。

**学校电脑跑得很卡**
- 在基地（Base）按 **GRAPHICS: LOW**。
- 游戏开始几秒后如果侦测到很卡，也会自动切到低画质。

**多人连线连不上**
- 连线用的是 WebRTC 点对点技术，房间号透过免费的 PeerJS 公共服务交换，不需要额外设定。
- 同一个学校网络里通常没问题。如果学校防火墙挡住了，会出现 "Could not connect" 的讯息：
  - 请学校 IT 开放 `0.peerjs.com` 和 WebRTC，或者
  - 告诉我，我可以改用 Google Firebase 来连线（需要多做一个免费的设定）。
- 开房的人如果关掉网页或断线，这场比赛会结束，大家各自看到成绩。

**全班同时交成绩会不会塞车？**
- Apps Script 会让成绩一个一个排队写入。
- 偶尔太挤而失败的，游戏会暂存在电脑里，之后自动补送。
