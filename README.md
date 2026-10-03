# Digi Monster Typer

An English typing game with cute chibi Digimon from the first three anime seasons. Each student has a **partner Digimon**. Type the words on the enemy Digimon to attack and beat them — type well and your partner **digivolves** to its Mega form! Every stage ends with a giant boss.
Play solo, or team up with 2–4 classmates online and race each other for points.

- **Play:** https://claudepro-fyhs.github.io/typing-game-digitalmonster/
- **Leaderboard:** the **LEADERBOARD** tab at the top of the game
- **Teacher dashboard:** the **TEACHER** tab at the top of the game (the password is set in the Google Sheet)

> 中文说明请看 [README_cn.md](README_cn.md)。

---

## Files

| File | What it is | Does the teacher need to edit it? |
|---|---|---|
| `index.html` | The game page (screens, leaderboard, teacher dashboard) | No |
| `config.js` | Where the Apps Script URL goes | **Once, during first-time setup** |
| `words.js` | Word banks (11 banks, about 2,800 words, including **Digital World & Monsters**) | Only to add words (see below) |
| `meanings.js` | Chinese meanings shown when a word is beaten | Only to add meanings for new words |
| `apps-script/Code.gs` | The backend that you paste into Google Apps Script | No (just copy and paste it, following the steps) |
| `models.js` | The monster list and how they move: 15 partners (each with a Mega form) + 13 Royal Knights, 13 enemies, 15 bosses + 17 festival bosses | No |
| `art/` | The pictures (one SVG file per Digimon, made by `tools/art/`) | No |
| `js/` | Game code (solo, multiplayer, levels and badges, leaderboard, teacher dashboard) | No |
| `lib/` | Three.js (3D engine) and PeerJS (multiplayer), both MIT-licensed | No |
| `tests/` | Automatic tests (backend and browser) | No |
| `CLAUDE.md` | Developer guide: how the code works, how to run the tests, how to make a new game from this one | No |

---

## First-time setup (do these in order, about 30 minutes)

### Step A: Google Cloud Client ID (lets students sign in with their school accounts)

> Sign in with your **school account** to do this.

1. Open https://console.cloud.google.com/, click the project picker at the top left, then click **NEW PROJECT**.
   - Name it `digi-monster-typer`, click **CREATE**, and then **SELECT PROJECT** when it's ready.
   - (If you already made a Client ID for another typing game on `https://claudepro-fyhs.github.io`, you can reuse it and skip Step A.)
2. Search for **Google Auth Platform** in the top search bar and click **Get started**:
   - App name: `Digi Monster Typer`
   - Support email: choose your email
   - Audience: choose **External** (so students' personal Google accounts can sign in too; choose **Internal** if only school accounts should play)
   - Contact email: your email
   - Tick the agreement box, then click **Create**
3. In the left menu choose **Clients**, then click **+ Create client**:
   - Application type: **Web application**
   - Under **Authorized JavaScript origins**, click **+ Add URI** and enter `https://claudepro-fyhs.github.io`
   - Click **Create**
4. Copy the **Client ID** shown on screen (it looks like `xxxx.apps.googleusercontent.com`). You'll need it in Step B.

### Step B: Create the Google Sheet and Apps Script (where scores are collected)

1. In Google Drive, click **New → Google Sheets** and name the file `Digi Monster Typer Scores`. Use a **new** sheet — don't reuse another game's sheet.
2. In the spreadsheet menu, click **Extensions → Apps Script**.
3. In the Apps Script page that opens:
   1. **Delete everything** in `Code.gs`.
   2. Open https://github.com/claudepro-FYHS/typing-game-digitalmonster/blob/main/apps-script/Code.gs and click the **Copy raw file** icon (two squares) at the top right. This copies the whole file.
   3. Go back to Apps Script and paste.
   4. Click 💾 (Save).
4. In the function menu on the toolbar (next to "Debug"), choose **setup**, then click **▶ Run**.
5. The first run asks for permission:
   1. Click **Review permissions** and choose your school account.
   2. If you see "Google hasn't verified this app", click **Advanced**, then **Go to … (unsafe)**. This is your own script, so it is safe.
   3. Click **Allow**.
   4. When the execution log shows `Setup done. 设置完成！`, it worked.
6. Back in the spreadsheet you'll see seven new tabs: **Scores, Players, Settings, BannedWords, Admins, CoinGifts, Events**. In the **Settings** tab, edit column B:
   - **ClassCounts**: how many classes each form has, e.g. `J1:12, J2:12, J3:12, S1AC:4, S1S:6, S2AC:4, S2S:6, S3AC:4, S3S:6`. **Change the numbers to the school's real class counts.** Students choose their form, then their class number.
   - **AllowOtherAccounts**: `YES` lets non-school Google accounts play too (see "Players from outside the school" below); `NO` = school accounts only.
   - **TeacherPassword**: the teacher dashboard password. **Be sure to change** the default `change-me-2026`.
   - **GoogleClientId**: paste the Client ID from Step A
7. Publish it as a web app: back in Apps Script, click **Deploy → New deployment** at the top right.
   1. Click the ⚙ gear next to "Select type" and choose **Web app**.
   2. Description: `v1`
   3. Execute as: **Me**
   4. Who has access: **Anyone**
   5. Click **Deploy** and copy the **Web app URL** (it ends with `/exec`).

> ❗ If "Who has access" has no **Anyone** option, only "Anyone within foonyew.edu.my", the school administrator has locked it.
> With "Anyone within foonyew.edu.my" the game page cannot connect. Ask the school IT team to allow it, or contact the maintainer for an alternative.

### Step C: Paste the URL into `config.js`

1. Open https://github.com/claudepro-FYHS/typing-game-digitalmonster/blob/main/config.js
2. Click ✏️ (Edit this file) at the top right.
3. Paste the URL from Step B-7 **between the two quotes** of `APPS_SCRIPT_URL: ""`, for example:
   ```js
   APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycb.../exec",
   ```
4. Click the green **Commit changes…** button at the top right, then **Commit changes** again.

### Step D: Turn on GitHub Pages (makes the game URL work)

1. Open https://github.com/claudepro-FYHS/typing-game-digitalmonster/settings/pages
2. Under **Source**, choose **Deploy from a branch**.
3. Under **Branch**, choose **main** and the **/ (root)** folder, then click **Save**.
4. Wait 1–3 minutes, then open https://claudepro-fyhs.github.io/typing-game-digitalmonster/ to play.
   - Every later change (for example to `config.js`) also takes 1–3 minutes to appear.

### Step E: Test it

1. Open the game, click **Sign in with Google**, and sign in with a school account.
2. Fill in class, seat number, name and nickname.
3. Play one game for at least 20 seconds.
4. When the results screen shows **✔ Saved to your class record**, a new row appears in the **Scores** tab of the Google Sheet.
5. Click **TEACHER** at the top, enter the password, and check that the dashboard shows the data.

---

## Changing settings later

Everything is changed in the Google Sheet. **You don't need to touch GitHub.** Changes take effect when students refresh the page.

| What to change | Where |
|---|---|
| Number of classes in each form | **Settings** tab → `ClassCounts`, e.g. `J1:12, S2AC:4` |
| Let non-school Google accounts play | **Settings** tab → `AllowOtherAccounts` (`YES` / `NO`) |
| Start the new school year early or late | **Settings** tab → `SchoolYear` (see below) |
| Teacher dashboard password | **Settings** tab → `TeacherPassword` |
| Minimum accuracy for the leaderboard | **Settings** tab → `LeaderboardMinAccuracy` (default 80) |
| A student's inappropriate nickname | **Players** tab → edit the `Nickname` cell directly |
| Add a banned word | **BannedWords** tab → one word per row in column A |
| A student entered the wrong class or name | Edit the **Players** tab directly. New scores use the new details; fix old scores yourself in the **Scores** tab |
| Delete test scores | Delete the whole row in the **Scores** tab |
| Set up admins | **Admins** tab → email in column A, `YES` in column B (see below) |
| Give coins to students | **CoinGifts** tab (see below) |
| Change one student's coins directly | **Players** tab → edit the `Coins` cell |
| Turn a festival off | **Settings** tab → `DisabledEvents` (see below) |
| School anniversary dates | **Events** tab (see below) |

### Admins (Admins tab)

- Put an email in column A (for example your own `xxx@foonyew.edu.my`) and `YES` in column B.
- Admins see their coins as **∞** and can use all 28 partners right away.
- Admin games are recorded in the Scores tab but **never appear on the leaderboard or the teacher dashboard**, so they don't affect student data.
- When an admin fills in their profile, they can choose **STAFF** as their class.
- To remove an admin, change column B to `NO` or delete the row.

### Giving coins (CoinGifts tab)

Each row is one gift:

| Column A: who | Column B: coins | Column C: note (anything) | Column D: filled in automatically, don't edit |
|---|---|---|---|
| `amy@foonyew.edu.my` | 200 | Contest winner | |
| `J105` | 50 | Reward for class J105 | |
| `S2` | 30 | Every S2 class (S2AC and S2S) | |
| `ALL` | 100 | School holiday gift | |

- Column A can be one student's email, a class (e.g. `J105`), a form (`J1`, `S2`, `S2AC` …), or `ALL` (every school student; players from outside the school are not included).
- Each student receives each gift only once. Next time they open the game they'll see "🎁 Your teacher sent you … coins!".
- A negative number in column B takes coins away (never below 0).

### Festival events (automatic)

The game has **18 festival events** and switches them on by itself — you don't need to type any dates.

| Festival | ID | When (Malaysia time) | Festival boss |
|---|---|---|---|
| 🧧 Chinese New Year | `cny` | **all of January and February** | Azulongmon |
| 🏮 Lantern Festival (元宵) | `lantern` | 15th day of the 1st lunar month, ±7 days | Zhuqiaomon |
| 🌿 Qingming (清明) | `qingming` | about 4–5 April, ±7 days | *(no special boss — normal bosses)* |
| 🐉 Dragon Boat (端午) | `dragonboat` | 5th day of the 5th lunar month, ±7 days | MegaSeadramon |
| 🌌 Qixi (七夕) | `qixi` | 7th day of the 7th lunar month, ±7 days | Sinduramon |
| 🥮 Mid-Autumn (中秋) | `midautumn` | 15th day of the 8th lunar month, ±7 days | Antylamon |
| ⛰️ Double Ninth (重阳) | `doubleninth` | 9th day of the 9th lunar month, ±7 days | Ebonwumon |
| 🍡 Winter Solstice (冬至) | `solstice` | about 21–22 December, ±7 days | IceDevimon |
| 🎆 New Year's Day | `newyear` | 1 January, ±7 days | Diaboromon |
| 💝 Valentine's Day | `valentine` | 14 February, ±7 days | LadyDevimon |
| 🤡 April Fools' Day | `aprilfools` | 1 April, ±7 days | Etemon |
| 🥚 Easter | `easter` | Easter Sunday, ±7 days | Digitamamon |
| 💐 Mother's Day | `mothersday` | 2nd Sunday of May, ±7 days | Mother D-Reaper |
| 👔 Father's Day | `fathersday` | 3rd Sunday of June, ±7 days | Leomon |
| 🎃 Halloween | `halloween` | 31 October, ±7 days | Pumpkinmon |
| 🎄 Christmas | `christmas` | 25 December, ±7 days | Cherrymon |
| 🌺 Merdeka Day | `merdeka` | 31 August, ±7 days | Parrotmon |
| 🎓 School anniversary | `anniversary` | **you type the dates** in the Events tab | Baihumon |

- Every festival lasts from **one week before to one week after** its day (Chinese New Year: the whole of January and February).
- **When two festivals overlap**: the festival whose day is *today* wins; otherwise the **shorter** event wins (so Valentine's Day and the Lantern Festival show up even inside the Chinese New Year months).
- Western festivals and Merdeka repeat every year by themselves. Lunar festival dates are built in for **2026–2030**. From 2031, add rows to the **Events** tab (see below), or ask someone to extend the table in `js/calendar.js`.
- During an event: a banner appears, a **festival word bank** is added to the word bank list, stages 1, 3, 5 … bring the festival boss, the sky gets festival decorations (lanterns, fireworks, snow, pumpkins …), and **coins are ×1.5**.
- The festival word bank contains **only festival words** (about 60 per festival, all with Chinese meanings). Students who choose another word bank still get the boss, decorations and ×1.5 coins.
- April Fools' special: sometimes a beaten virus "comes back to life" with an 🤡 APRIL FOOL! message (you still keep the points).
- Playing during an event earns the **🏮 Festival Hero** badge.

**Turning a festival off:** in the **Settings** tab, put the IDs in `DisabledEvents`, separated by commas — for example `halloween, aprilfools`. Leave it blank to keep all festivals on.

**Events tab** (only for extra dates):

| Column A: event ID | Column B: start | Column C: end | Column D: note |
|---|---|---|---|
| `anniversary` | 2026-11-01 | 2026-11-07 | School anniversary |
| `midautumn` | 2031-09-24 | 2031-10-08 | (example: a lunar festival after 2030) |

- Dates are in Malaysia time, written as `YYYY-MM-DD`.
- The school anniversary only runs when you fill in its dates here. Update them every year.

### Adding words (words.js)

1. Open `words.js` on GitHub and click ✏️ to edit.
2. Add new words inside the quotes of the right word bank, separated by spaces. Use only the letters a–z; duplicates are removed automatically.
3. Click **Commit changes** to save. The change appears after 1–3 minutes.
4. Optional: add the word's Chinese meaning to `meanings.js` (one line: `word 中文`) so it shows up when the word is beaten.

> You only need to redeploy when `Code.gs` itself is updated:
> 1. Paste the new code and save. Choose **setup** in the function menu and click **▶ Run** once (it adds any new tabs and columns without deleting data).
> 2. Click **Deploy → Manage deployments**, then click ✏️.
> 3. Set "Version" to **New version** and click **Deploy**.
>
> The URL stays the same, so `config.js` doesn't need to change.

---

## How to play (for students)

- Type the word on a virus monster to lock on and attack. Finish the word to beat it.
- A virus that reaches you costs 1 ♥. Lose all your ♥ and the game ends. Every boss you defeat gives back 1 ♥.
- Keys:
  - `Backspace`: release your current target
  - `Esc`: pause
  - `1`: 💣 clear the screen
  - `2`: ❄️ freeze viruses for 5 seconds
  - `3`: 🛡️ shield (blocks one hit)
- **Evolution:** many partners have a **special move**: type several words in a row without a mistake, then press `Space` (the 🧬 at the bottom shows your progress). Your partner **evolves** into its bigger form and attacks. Every partner also evolves after **20 words in a row** and stays evolved until you make **3 mistakes** (this is just for looks). Each partner has its own attack: some shoot fireballs or beams, others fly up to the enemy, strike and fly back (Omnimon randomly uses the Garuru Cannon or the Transcendent Sword). The 13 **Royal Knights** are already Mega and don't evolve: at a combo of 25, 50 and 100 they give you an item instead.
- Partners just play differently. A more expensive partner is **not** simply stronger:
  - Every partner has 4–6 ♥
  - Partners with more ♥ earn fewer coins
  - Coins only buy partners and colors, never items
- The partners are the 15 heroes of *Digimon Adventure*, *Adventure 02* and *Tamers*; in battle they stand on the left and the enemies come from the upper right. All pictures are fan-made chibi drawings for classroom use (Digimon belongs to Bandai / Toei Animation):

| Partner → Mega form | Type | Price | ♥ | Features |
|---|---|---|---|---|
| Agumon → WarGreymon | Vaccine · Reptile | Free | 5 | Balanced; starts every stage with a shield |
| Gabumon → MetalGarurumon | Data · Reptile | 300 | 4 | Coins +20% |
| Palmon → Rosemon | Data · Plant | 300 | 5 | Items drop ×1.6; coins −10% |
| Tentomon → HerculesKabuterimon | Vaccine · Insect | 400 | 5 | Special: 3 words in a row → beats the closest target |
| Biyomon → Phoenixmon | Vaccine · Bird | 400 | 4 | Boss attacks 25% slower; coins +10% |
| Gomamon → Vikemon | Vaccine · Sea animal | 600 | 5 | Special: 5 in a row → freezes viruses for 4 s |
| Armadillomon → Shakkoumon | Free · Mammal | 600 | 6 | Special: 6 in a row → beats 2 targets; coins −20% |
| Gatomon → Ophanimon | Vaccine · Holy beast | 800 | 4 | Special: 5 in a row → viruses at half speed for 6 s |
| Terriermon → MegaGargomon | Vaccine · Beast | 900 | 5 | Special: 8 in a row → beats 5 targets |
| Patamon → Seraphimon | Data · Mammal | 900 | 5 | Special: 5 in a row → gives you a shield |
| Veemon → Imperialdramon | Free · Dragon | 1000 | 5 | Coins +10%; special: 3 in a row → beats the closest target |
| Renamon → Sakuyamon | Data · Beast | 1000 | 5 | Special: 6 in a row → viruses slow down for 8 s |
| Guilmon → Gallantmon | Virus · Reptile | 1100 | 5 | Special: 7 in a row → beats 4 targets |
| Wormmon → GrandisKuwagamon | Free · Insect | 1100 | 5 | Special: 6 in a row → freezes viruses for 6 s; items ×1.2 |
| Hawkmon → Valdurmon | Data · Bird | 1200 | 4 | Special: 5 in a row → beats 3 targets |

**Royal Knights** (already Mega, so they do not evolve; a combo of 25, 50 and 100 words gives them their item, up to 3):

| Royal Knight | Price | ♥ | Special | Combo item |
|---|---|---|---|---|
| Omnimon | 3000 | 5 | 6 in a row → beats 4 targets | 💣 |
| Alphamon | 2800 | 5 | 5 in a row → beats 3 targets | 💣 |
| Gallantmon Crimson Mode | 2500 | 5 | 5 in a row → shield | 🛡️ |
| Magnamon | 2500 | 6 | 6 in a row → shield | 🛡️ |
| UlforceVeedramon | 2500 | 4 | 5 in a row → viruses slow down for 8 s | ❄️ |
| Examon | 2500 | 6 | 8 in a row → beats 5 targets | 💣 |
| Craniamon | 2200 | 6 | 6 in a row → shield | 🛡️ |
| Dynasmon | 2000 | 5 | 4 in a row → beats 2 targets | 💣 |
| Crusadermon | 2000 | 4 | 6 in a row → freezes viruses for 6 s | ❄️ |
| Sleipmon | 2000 | 5 | 6 in a row → freezes viruses for 6 s | ❄️ |
| Jesmon | 2000 | 5 | 5 in a row → beats 3 targets | 💣 |
| Leopardmon | 1800 | 5 | 6 in a row → viruses slow down for 8 s | ❄️ |
| Gankoomon | 1800 | 6 | 2 in a row → beats the closest target | 💣 |

- **Enemies:** Numemon, DemiDevimon, Gazimon, Bakemon (short words); Goblimon, Meramon, Snimon, Kuwagamon (medium); Ogremon, Monochromon, DarkTyrannomon, Golemon, Seadramon (long words).
- **Bosses** (unlocked in this order): Devimon, MetalEtemon, Myotismon, Kimeramon, Daemon, the Dark Masters (MetalSeadramon, Puppetmon, Machinedramon, Piedmon), VenomMyotismon, BlackWarGreymon, Beelzemon, Megidramon, MaloMyotismon and Apocalymon.

### Levels, badges, colors and battlefields

- **Tamer level:** every battle earns XP (viruses beaten, bosses, stages and typing speed). Levels go up to 50.
  - Each level unlocks one more **boss** (5 bosses at LV 1, all 15 by LV 11).
  - New **battlefields** unlock along the way: Data Plains (LV 1), Pixel Beach (LV 3), Glitch Forest (LV 6), Byte Desert (LV 10), Neon City (LV 15) and Dark Network (LV 20).
- **Badges:** 19 badges, such as *Combo Master* (50 words in a row), *Dedicated* (play on 5 days in one week), *Mega Evolution* (80 WPM) and *Avenger* (beat 20 revenge viruses). Click **🏅 BADGES** at the base to see them all.
- **Titles:** choose an earned badge as your title. It appears next to your nickname on the leaderboard.
- **Colors:** the 🎨 **COLORS** tab at the base sells 7 color swaps (Sand Data, Ice Data, Sakura, Virus Black, Neon Cyber, Golden Shine and Ghost Data). They work on every partner you own.

### Fun extras

- **Combo effects:** at 10, 25, 50 and 100 words in a row a big **COMBO** banner appears, a ring glows under your partner, the screen edges light up and the music speeds up. At 20 your partner evolves (Royal Knights give items at 25, 50 and 100 instead).
- **Final blow:** when a boss goes down, the game switches to slow motion and the camera rushes in before the big explosion.
- **Revenge viruses:** words you mistyped come back in your next solo game as golden ⭐ viruses worth **double points and coins**. Beat one and that word leaves your revenge list.
- **Chinese meanings:** when a word is beaten, its Chinese meaning pops up (switch it off with the **中文** button at the base). Mistyped words on the results screen show their meanings too.
- **Share card:** the results screen has **📸 SHARE CARD**, which makes a picture with your partner and its evolved form, WPM, accuracy, combo, level and title that students can save and share.
- **Background music:** a small built-in 8-bit soundtrack (switch it off with the **MUSIC** button).

### Multiplayer (2–4 players)

1. Everyone must **sign in with their school account**.
2. One player clicks **👥 MULTIPLAYER → CREATE ROOM** at the base. A 5-character **room code** appears.
   - The match uses this player's difficulty and word bank from the base.
   - Choose 3 stages, 5 stages, or endless.
3. Everyone else clicks **👥 MULTIPLAYER**, enters the room code, and clicks **JOIN**.
   - Or the host clicks **COPY INVITE LINK** and pastes the link into the class chat. Classmates who open the link and sign in join the room automatically.
4. When everyone is in, the host clicks **START MATCH**.

**How it works**
- Everyone shares one battlefield and can attack any virus. **Whoever finishes the word first gets the points** (you can steal kills).
- Viruses **attack every player equally**. The color on the left of a word label shows who that virus is coming for, and a red frame means it's coming for you. So choose your strategy: protect yourself first, or steal points from others?
- The small colored bars under a word show how far other players have typed it.
- Items and special moves only affect viruses coming for you.
- Players whose partner goes down watch the rest of the match while the others keep going. Players are ranked by score at the end.
- Multiplayer games are recorded for the teacher (the Mode column in the Scores tab says `Multi`) but **don't count for the leaderboard**. Having kills stolen lowers your WPM, so leaving them out keeps the solo leaderboard fair.

---

## How scores work

- **WPM**: correctly typed letters ÷ 5 ÷ minutes of actual combat. Stage intros and stage-clear screens don't count toward the time.
- **Accuracy**: correct keystrokes ÷ all keystrokes.
- **Time survived**: seconds from start to finish, not counting time spent paused.
- Games shorter than 20 seconds or with fewer than 20 keystrokes are not recorded.
- Words are drawn like cards from a deck: no word repeats until the whole word bank has been used.

**Leaderboard**
- **⚔️ Class Battle:** every virus beaten this week (solo and multiplayer) counts for the player's class. Classes are ranked by total kills in three boards: **Junior** (J1–J3), **Senior** (S1–S3) and **Whole school**, each with last week's champion class.
- Separate boards for each difficulty, each with "This week" and "All time".
- Ranked by WPM; accuracy must be at least 80% to appear.
- Solo games only; admins are not included.
- Each student appears once, with their best game. Only their nickname, level and chosen title are shown.
- "This week" uses Malaysia time and starts on Monday at 00:00.

**Teacher dashboard**
- Average speed for each class
- Each student's best score and improvement (average of the latest 3 games − average of the first 3 games)
- The 20 words each class mistypes most often

---

## Classes, the new school year, and players from outside the school

**Classes.** Students pick their **form** (J1, J2, J3, S1AC, S1S, S2AC, S2S, S3AC, S3S) and then their **class number**. The class is saved like this:
- Junior classes have a 2-digit number: J1 class 5 → **`J105`**, J3 class 11 → **`J311`**
- Senior classes don't: S2AC class 3 → **`S2AC3`**, S1S class 6 → **`S1S6`**

The forms and how many classes each has come from `ClassCounts` in the **Settings** tab. If you add a new kind of form, just add it there (e.g. `S1X:2`).

**New school year.** On **1 January** every year, each student is asked to choose their new class and seat number the next time they sign in. Their coins, partners, level and badges are kept. Old scores keep the class they had at the time. If your school year changes on another day, type the year into `SchoolYear` yourself (e.g. type `2027` on the day you want the change); leave it blank to switch automatically on 1 January.

**Players from outside the school** (`AllowOtherAccounts` = `YES`):
- Anyone with a Google account (e.g. Gmail) can sign in. Their coins, partners, level and badges are saved just like a student's.
- They only choose a nickname (a name is optional). They don't choose a class or seat number. In the Players and Scores tabs their class is **`OTHER`**.
- They appear on the leaderboard with a 🌐 next to their nickname. They are **not** counted in the Class Battle, and they are grouped under `OTHER` in the teacher dashboard.
- For this to work, the Google Cloud sign-in must be set to **External** (Step A). If you chose **Internal** before: open https://console.cloud.google.com/ → **Google Auth Platform → Audience** → **Make external**, then make sure the publishing status is **In production** (click **Publish app** if it says *Testing*). The game only asks for name and email, so Google does not need to review the app.
- Set `AllowOtherAccounts` to `NO` at any time: outside players can no longer sign in, and they disappear from the leaderboard (their data stays in the sheet).

---

## Privacy and security

- The teacher password is stored only in your Google Sheet and is checked by Apps Script. **It is not in the public web page code.**
- The leaderboard sends out only nicknames, WPM, accuracy and dates. **Real names and emails are never sent.**
- When a player signs in, Apps Script checks the sign-in token with Google, so nobody can submit scores pretending to be someone else, even if they know the backend URL. Only `@foonyew.edu.my` accounts can choose a class; other Google accounts are accepted only while `AllowOtherAccounts` is `YES`.
- A student's sign-in is kept only in the current browser tab and ends when the browser is closed. School computers are shared, so please still remind students to click **Sign out** when they finish.
- If a score can't be uploaded (for example, the network is down), the game still shows the result and keeps it on that computer. It is sent automatically the next time the game is opened, within 12 hours.

---

## FAQ

**Students see "Can't reach the school server"**
- Check that "Who has access" in Step B-7 is set to **Anyone**.
- Check that the URL in `config.js` is complete and ends with `/exec`.

**The sign-in button doesn't appear**
- Check that `GoogleClientId` is filled in on the Settings tab.
- Check that the Authorized JavaScript origin in Step A is `https://claudepro-fyhs.github.io`.

**The game runs slowly on school computers**
- Click **GRAPHICS: LOW** at the base.
- If the game detects that it's running slowly in the first few seconds, it also switches to low graphics automatically.

**Multiplayer won't connect**
- Multiplayer uses peer-to-peer WebRTC. Room codes are matched through the free public PeerJS service, so no extra setup is needed.
- It usually works within the same school network. If the school firewall blocks it, players see a "Could not connect" message:
  - ask the school IT team to allow `0.peerjs.com` and WebRTC, or
  - contact the maintainer to switch to Google Firebase for connections (this needs one extra free setup step).
- If the host closes the page or loses connection, the match ends and everyone sees their own results.

**Will scores get jammed if the whole class submits at once?**
- Apps Script writes scores one at a time in a queue.
- If a submission occasionally fails because it's too busy, the game keeps it on the computer and sends it again automatically later.
