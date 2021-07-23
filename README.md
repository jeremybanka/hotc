# HOTC: "Heart of the Cards"
Server for [Topdeck](https://github.com/jeremybanka/topdeck)

#### By Jeremy Banka

## Technologies Used

- 🖋 TypeScript
- 📦 Node.js
- ⏭ Express.js
- 🔌 Socket.io
- 🧊 Webpack 5
- 🃏 Jest
- 🛠️ Eslint Airbnb

## Description

Host a rich multiuser card gaming simulation between several react web clients.

### Minimum Viable Product

- Play *Hearts* together online.
- Server holds game state as source of truth.
- Client presents the game visually from your perspective.
- Secrecy. No peeking at other players’ cards, or attempts to track the state of play by remembering ids. (information comes from the server fully redacted of private/hidden state).
  - Note: this does not imply automated “rule enforcement” per se (this is out of scope), only that secrecy is implemented seriously. 'Illegal' player actions (e.g., suddenly drawing a bunch of cards from the main deck) are not blocked but are publicly ‘on the record'. For now, rules must be socially enforced. 
- Authentication. Only one client/socket per player account.

### Primary Stretch Goals

- Meta-signaling. See the current focus/mouseover of other players.
- Catch-up. If a player drops from the game and can’t receive emitted events, re-entering the game will fast-forward through the events they missed.

### Secondary Stretch Goals

- Working with React Mouse Position+Emotion to create a great right-click experience on the client.
- Developing a robust hotkeys system on the client with React Hotkeys.
- Maybe some kind of drag-and-drop system for 'picking up' cards in the client
- Add another similar game besides Five-Card draw, probably Texas Hold ‘Em.

## Setup/Installation Requirements

- `gh repo clone jeremybanka/hotc` OR `git clone https://github.com/jeremybanka/hotc` to download the repo
- `cd hotc` to enter the repo folder
- `npm i` to install necessary development dependencies to node_modules
- `npm run start` to run the server
- `npm run test` to see coverage and tests

## Known Bugs

- none identified

## License

GPL ^3.0

## Contact Information

hello (at) jeremybanka (dot) com
