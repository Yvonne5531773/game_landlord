var http = require("http"),
url = require("url"),
path = require("path"),
fs = require("fs");

// var step = require('step'); // 同步执行

/** === 开始游戏定义 === */

var
/** 默认值 @const {number} */ MsgResultNone = 0,
/** 玩家超时 @const {number} */ MsgResultTimeout = 1,
/** 玩家操作不符合规则 @const {number} */ MsgResultInvalidOperation = 2,
/** 玩家叫地主 @const {number} */ MsgResultCallLandlordYes = 3,
/** 玩家不叫地主 @const {number} */ MsgResultCallLandlordNo = 4,
/** 玩家出牌 @const {number} */ MsgResultPlayCardsYes = 5,
/** 玩家不出牌 @const {number} */ MsgResultPlayCardsNo = 6,
/** 玩家因出牌不符合规则，被强制跳过本次出牌 @const {number} */ MsgResultPlayCardsInvalidPass = 7,
/** 玩家因出牌不符合规则，被强制出一张牌 @const {number} */ MsgResultPlayCardsInvalidForce = 8,
/** 玩家因操作超时，被强制跳过本次出牌 @const {number} */ MsgResultPlayCardsTimeoutPass = 9,
/** 玩家因操作超时，被强制出一张牌 @const {number} */ MsgResultPlayCardsTimeoutForce = 10;

var
/** 默认值 @const {number} */ StyleNull = 0,
/** 红桃 @const {number} */ StyleHeart = 1,
/** 黑桃 @const {number} */ StyleSpade = 2,
/** 方块 @const {number} */ StyleDiamond = 3,
/** 梅花 @const {number} */ StyleClub = 4,
/** 小王 @const {number} */ StyleBlackJoker = 5,
/** 大王 @const {number} */ StyleRedJoker = 6;

var
/** @const {number} */ PointNull = 0,
/** @const {number} */ PointA = 1,
/** @const {number} */ Point2 = 2,
/** @const {number} */ Point3 = 3,
/** @const {number} */ Point4 = 4,
/** @const {number} */ Point5 = 5,
/** @const {number} */ Point6 = 6,
/** @const {number} */ Point7 = 7,
/** @const {number} */ Point8 = 8,
/** @const {number} */ Point9 = 9,
/** @const {number} */ Point10 = 10,
/** @const {number} */ PointJ = 11,
/** @const {number} */ PointQ = 12,
/** @const {number} */ PointK = 13,
/** @const {number} */ PointMax = 13;

/**
 * 牌定义
 * @param {number} style 花色, must be Style*
 * @param {number} point 点数, must be Point*
 */
var Card = function(style, point) {
    this.style = style;
    this.point = point;
};

/**
 * 叫地主的返回值
 * @param {string} result 结果,
 */
var CallLandlordReply = function(result, base_score) {
    this.result = result;
    this.base_score = base_score;
};

/**
 * 出牌结果
 * @param {number} result 是否出牌, must be MsgResultPlayCardsYes or MsgResultPlayCardsNo
 * @param {Array.<Card>} cards 牌列表
 */
var PlayResult = function(result, cards) {
    this.result = result;
    this.cards = cards;
};

/** === 结束游戏定义 === */

/** debug 开关 */
var DEBUG = true;

/**
 * 日志函数
 */
var log = function(msg) {
    if (DEBUG) {
        console.log(msg);
    }
};



/**
 * 游戏玩家, 请实现其逻辑
 */
var player = {
    position: 0,

    /***
     * 游戏初始化
     * @param {number} position 玩家位置
     */
    onInit: function(position) {
        this.position = position;
    },

    /**
     * 游戏开始(广播消息)
     * @param {Array.<number>} orders 抢地主的顺序
     */
    onNewGame: function(orders) {
        log("onNewGame");
    },

    /**
     * 开始洗牌(广播消息)
     */
    onShuffleCards: function() {
        log("onShuffleCards");
    },

    /**
     * 开始发牌(广播消息)
     */
    onDealCards: function() {
        log("onDealCards");
    },

    /**
     * 向指定玩家发牌(定向消息)
     * @param {Array.<Card>} cards 发给自己的牌数组
     */
    onDealCardsToMe: function(cards) {
        log("onDealCardsToMe");
    },

    /**
     * 盖下底牌(广播消息)
     */
    onCoverHandCards: function() {
        log("onCoverHandCards");
    },

    /**
     * 准备叫地主(广播消息)
     */
    onPrepareCallLandlord: function() {
        log("onPrepareCallLandlord");
    },

    /**
     * 等待指定玩家叫地主
     * @param {number} position 玩家位置
     * @param {number} base_score 当前底分
     */
    onWaitPlayerCallLandlord: function(position, base_score) {
        log("onWaitPlayerCallLandlord");
    },

    /**
     * 询问指定玩家叫地主
     * @return {CallLandlordReply} 叫地主的结果
     */
    onInquirePlayerCallLandlord: function() {
        log("onInquirePlayerCallLandlord");
        // TODO: 实现逻辑
        return new CallLandlordReply(MsgResultCallLandlordNo, 0);
    },

    /**
     * 指定玩家叫地主的结果
     * @param {number} position 玩家位置
     * @param {number} result 是否叫地主
     * @param {number} base_score 玩家叫分
     */
    onResultOfCallLandlord: function(position, result, base_score) {
        log("onResultOfCallLandlord");
    },

    /**
     * 谁是地主
     * @param {number} position 地主位置
     */
    onTheLandlord: function(position) {
        log("onTheLandlord");
    },

    /**
     * 亮出底牌
     * @param {Card} card1 底牌1
     * @param {Card} card2 底牌2
     * @param {Card} card3 底牌3
     */
    onTurnOverHandCards: function(card1, card2, card3) {
        log("onTurnOverHandCards");
    },

    /**
     * 等待指定玩家出牌
     * @param {number} position 玩家位置
     */
    onWaitPlayCards: function(position) {
        log("onWaitPlayCards");
    },

    /**
     * 询问指定玩家出牌
     * @return {PlayResult} 出牌结果
     */
    onInquirePlayCards: function() {
        log("onInquirePlayCards");
        // TODO: 实现逻辑
        return new PlayResult(MsgResultPlayCardsNo, null);
    },

    /**
     * 指定玩家出牌结果
     * @param {number} position 玩家位置
     * @param {number} result 出牌结果
     * @param {number} cards 出牌列表
     */
    onResultOfPlayCards: function(position, result, cards) {
        log("onResultOfPlayCards");
    },

    /**
     * 炸弹
     * @param {number} position 玩家位置
     */
    onBomb: function(position) {
        log("onBomb");
    },

    /**
     * 当前游戏底分和倍数
     * @param {number} base_score 底分
     * @param {number} multiples 倍数
     */
    onBaseScoreAndMultiples: function(base_score, multiples) {
        log("onBaseScoreAndMultiples");
    },

    /**
     * 本局游戏结束
     * @param {boolean} landlord_win 是否地主获胜
     */
    onGameOver: function(landlord_win) {
        log("onGameOver");
    },

    /**
     * 本局游戏玩家得分
     * @param {number} position 玩家位置
     * @param {number} score 玩家得分
     */
    onGameScore: function(position, score) {
        log("onGameScore");
    },
    /**
     * 比赛结束
     */
    onTheEnd: function() {
        log("onTheEnd");
    }
};

http.createServer(function(req, res) {
    var data = null;
    try {
        data = JSON.parse(req.body)
    } catch(err) {
    }
    var ret = null;
    var fun_name = url.parse(req.url).pathname.substring(1);
    log(fun_name);
    if (fun_name == "Init") {
        if (data) {
            player.onInit(data.position)
        }

    } else if (fun_name == "NewGame") {
        if (data) {
            player.onNewGame(data.orders);
        }

    } else if (fun_name == "ShuffleCards") {
        player.onShuffleCards();

    } else if (fun_name == "DealCards") {
        player.onDealCards();

    } else if (fun_name == "DealCardsToMe") {
        if (data) {
            player.onDealCardsToMe(data.cards);
        }

    } else if (fun_name == "CoverHandCards") {
        player.onCoverHandCards();

    } else if (fun_name == "PrepareCallLandlord") {
        player.onPrepareCallLandlord();

    } else if (fun_name == "WaitPlayerCallLandlord") {
        if (data) {
            player.onWaitPlayerCallLandlord(data.position, data.base_score);
        }

    } else if (fun_name == "InquirePlayerCallLandlord") {
        ret = player.onInquirePlayerCallLandlord();

    } else if (fun_name == "ResultOfCallLandlord") {
        if (data) {
            player.onResultOfCallLandlord(data.position, data.result, data.base_score);
        }

    } else if (fun_name == "TheLandlord") {
        if (data) {
            player.onTheLandlord(data.position);
        }

    } else if (fun_name == "TurnOverHandCards") {
        if (data) {
            player.onTurnOverHandCards(data.card1, data.card2, data.card3);
        }

    } else if (fun_name == "WaitPlayCards") {
        if (data) {
            player.onWaitPlayCards(data.position);
        }

    } else if (fun_name == "InquirePlayCards") {
        ret = player.onInquirePlayCards();

    } else if (fun_name == "ResultOfPlayCards") {
        if (data) {
            player.onResultOfPlayCards(data.position, data.result, data.cards);
        }

    } else if (fun_name == "Bomb") {
        if (data) {
            player.onBomb(data.position);
        }

    } else if (fun_name == "BaseScoreAndMultiples") {
        if (data) {
            player.onBaseScoreAndMultiples(data.base_score, data.multiples);
        }

    } else if (fun_name == "GameOver") {
        if (data) {
            player.onGameOver(data.landlord_win);
        }

    } else if (fun_name == "GameScore") {
        if (data) {
            player.onGameScore(data.position, data.score);
        }

    } else if (fun_name == "TheEnd") {
        player.onTheEnd();
    }

    if (ret) {
        var json_data = JSON.stringify(ret);
        log(json_data);
        res.end(json_data);

    } else {
        res.end('');
    }

}).listen(8000, "0.0.0.0");
