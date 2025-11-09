"use strict";
// Shared types between frontend and backend
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketEvents = exports.RoomStatus = exports.Rank = exports.Suit = exports.GameType = void 0;
var GameType;
(function (GameType) {
    GameType["EASY_PEASY"] = "easy_peasy";
    GameType["DEHLA_PAKAD"] = "dehla_pakad";
    GameType["TEEN_DO_PANCH"] = "teen_do_panch";
})(GameType || (exports.GameType = GameType = {}));
var Suit;
(function (Suit) {
    Suit["HEARTS"] = "hearts";
    Suit["DIAMONDS"] = "diamonds";
    Suit["CLUBS"] = "clubs";
    Suit["SPADES"] = "spades";
})(Suit || (exports.Suit = Suit = {}));
var Rank;
(function (Rank) {
    Rank["ACE"] = "A";
    Rank["TWO"] = "2";
    Rank["THREE"] = "3";
    Rank["FOUR"] = "4";
    Rank["FIVE"] = "5";
    Rank["SIX"] = "6";
    Rank["SEVEN"] = "7";
    Rank["EIGHT"] = "8";
    Rank["NINE"] = "9";
    Rank["TEN"] = "10";
    Rank["JACK"] = "J";
    Rank["QUEEN"] = "Q";
    Rank["KING"] = "K";
})(Rank || (exports.Rank = Rank = {}));
var RoomStatus;
(function (RoomStatus) {
    RoomStatus["WAITING"] = "waiting";
    RoomStatus["IN_PROGRESS"] = "in_progress";
    RoomStatus["FINISHED"] = "finished";
})(RoomStatus || (exports.RoomStatus = RoomStatus = {}));
// Socket Events
var SocketEvents;
(function (SocketEvents) {
    // Connection
    SocketEvents["CONNECT"] = "connect";
    SocketEvents["DISCONNECT"] = "disconnect";
    // Room Management
    SocketEvents["CREATE_ROOM"] = "create_room";
    SocketEvents["JOIN_ROOM"] = "join_room";
    SocketEvents["LEAVE_ROOM"] = "leave_room";
    SocketEvents["ROOM_CREATED"] = "room_created";
    SocketEvents["ROOM_JOINED"] = "room_joined";
    SocketEvents["ROOM_FULL"] = "room_full";
    SocketEvents["ROOM_NOT_FOUND"] = "room_not_found";
    SocketEvents["PLAYER_JOINED"] = "player_joined";
    SocketEvents["PLAYER_LEFT"] = "player_left";
    // Game Actions
    SocketEvents["GAME_START"] = "game_start";
    SocketEvents["GAME_END"] = "game_end";
    SocketEvents["CARDS_DEALT"] = "cards_dealt";
    SocketEvents["PLAY_CARD"] = "play_card";
    SocketEvents["CARD_PLAYED"] = "card_played";
    SocketEvents["TURN_CHANGE"] = "turn_change";
    SocketEvents["HAND_COMPLETE"] = "hand_complete";
    SocketEvents["HAND_WINNER"] = "hand_winner";
    SocketEvents["NEW_HAND_START"] = "new_hand_start";
    SocketEvents["GAME_WINNER"] = "game_winner";
    SocketEvents["SCORE_UPDATE"] = "score_update";
    SocketEvents["TRUMP_DECIDED"] = "trump_decided";
    SocketEvents["ADDITIONAL_CARDS_DEALT"] = "additional_cards_dealt";
    // Chat
    SocketEvents["SEND_MESSAGE"] = "send_message";
    SocketEvents["RECEIVE_MESSAGE"] = "receive_message";
    // Errors
    SocketEvents["ERROR"] = "error";
})(SocketEvents || (exports.SocketEvents = SocketEvents = {}));
//# sourceMappingURL=types.js.map