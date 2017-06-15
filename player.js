var http = require("http"),
    url = require("url"),
    // AI = require("./ai")(),
    path = require("path"),
    fs = require("fs"),
    AILogic = require("./logic/AILogic"),
    g = require("./logic/GameRule"),
    _ = require('lodash')

let GameRule = new g();

const
    /** 默认值 @const {number} */ StyleNull = 0,
    /** 黑桃 @const {number} */ StyleHeart = 1,
    /** 红桃 @const {number} */ StyleSpade = 2,
    /** 梅花 @const {number} */ StyleClub = 3,
    /** 方块 @const {number} */ StyleDiamond = 4,
    /** 小王 @const {number} */ StyleBlackJoker = 5,
    /** 大王 @const {number} */ StyleRedJoker = 6;

// var Step = require('step'); // 同步执行

/** === 开始游戏定义 === */

const
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

const
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
var Card = function (style, point) {
    this.style = style;
    this.point = point;
};

/**
 * 叫地主的返回值
 * @param {string} result 结果,
 */
var CallLandlordReply = function (result, base_score) {
    this.result = result;
    this.base_score = base_score;
};

/**
 * 出牌结果
 * @param {number} result 是否出牌, must be MsgResultPlayCardsYes or MsgResultPlayCardsNo
 * @param {Array.<Card>} cards 牌列表
 */
var PlayResult = function (result, cards) {
    this.result = result;
    this.cards = cards;
};

/** === 结束游戏定义 === */

/** debug 开关 */
var DEBUG = true;

/**
 * 日志函数
 */
var log = function (msg) {
    if (DEBUG) {
        console.log(msg);
    }
};


/**
 * 游戏玩家, 请实现其逻辑
 */
var player = {
    position: 0,
    mycards: [],
    originCards: [],
    myCardsOut: [],
    countNull: 0,
    // baseInfo: [],
    knowCards: [],
    prev: [],
    noChangePrev: [],
    othersMayHaveCards: [],
    lordPosition: -1,
    cardsNeedToAi: [],
    //是否叫地主
    callLandlord:0,
    roundWinner:{position:-1, cards: []},
    isLandlord: false,
    winCard: {},
    prePosition: -1,
    farmerAllData: [],
    lordPositionCardsLength:0,
    farmerAPositionCardsLength:0,
    farmerBPositionCardsLength:0,
    // me: {
    //   cards: [],
    //   isLord: false
    // },
    // player1: {
    //   cards: [],
    //   isLord: false
    // },
    // player2: {
    //   cards: [],
    //   isLord: false
    // }},

    /***
     * 游戏初始化
     * @param {number} position 玩家位置
     */
    onInit: function (position) {
        this.position = position;
        console.log("我的位置是========" + position);
    },

    /**
     * 游戏开始(广播消息)
     * @param {Array.<number>} orders 抢地主的顺序
     */
    onNewGame: function (orders) {
        log("游戏开始");
    },

    /**
     * 开始洗牌(广播消息)
     */
    onShuffleCards: function () {
        log("开始洗牌");
    },

    /**
     * 开始发牌(广播消息)
     */
    onDealCards: function () {
        log("onDealCards");
    },

    /**
     * 向指定玩家发牌(定向消息)
     * @param {Array.<Card>} cards 发给自己的牌数组
     */
    onDealCardsToMe: function (cards) {
        console.log('in onDealCardsToMe 向指定玩家发牌 cards', cards )
        player.originCards = cards.slice(0);
        let tmp = cards.slice(0)
        let handCards = [];
        tmp.forEach(function(card){
            handCards.push(changeCard(card));
        })
        player.mycards = handCards
        console.log('in onDealCardsToMe 向指定玩家发牌', player.mycards )
    },

    /**
     * 盖下底牌(广播消息)
     */
    onCoverHandCards: function () {
        log("盖下底牌");
    },

    /**
     * 准备叫地主(广播消息)
     */
    onPrepareCallLandlord: function () {
        log("准备叫地主");
    },

    /**
     * 等待指定玩家叫地主
     * @param {number} position 玩家位置
     * @param {number} base_score 当前底分
     */
    onWaitPlayerCallLandlord: function (position, base_score) {
        log("等待指定玩家叫地主");
    },

    /**
     * 询问指定玩家叫地主  至少有一个王和一个2才叫地主
     * @return {CallLandlordReply} 叫地主的结果
     */
    onInquirePlayerCallLandlord: function () {
        player.callLandlord = (new AILogic(player)).judgeScore();
        // player.jdz = AILogic.judgeScore(player.mycards)
        console.log("叫地主分数：", player.callLandlord);
        let isCall = player.callLandlord !=0 ? MsgResultCallLandlordYes : MsgResultCallLandlordNo;
        return new CallLandlordReply(isCall, player.callLandlord);
    },

    /**
     * 指定玩家叫地主的结果
     * @param {number} position 玩家位置
     * @param {number} result 是否叫地主
     * @param {number} base_score 玩家叫分
     */
    onResultOfCallLandlord: function (position, result, base_score) {
        log("指定玩家叫地主的结果");
        // player.position =
        // player.baseInfo.push({
        //     position: position,
        //     isLord: result,
        //     base_score: base_score,
        //     cards: []
        // });
        // console.log(position, result, base_score);
    },

    /**
     * 谁是地主
     * @param {number} position 地主位置
     */
    onTheLandlord: function (position) {
        console.log("地主位置: ", position);
        player.lordPosition = position;
        if(position === this.position) player.isLandlord = true;
    },

    /**
     * 亮出底牌
     * @param {Card} card1 底牌1
     * @param {Card} card2 底牌2
     * @param {Card} card3 底牌3
     */
    onTurnOverHandCards: function (card1, card2, card3) {
        console.log('in onTurnOverHandCards card1', card1)
        console.log('in onTurnOverHandCards card2', card2)
        console.log('in onTurnOverHandCards card3',card3)
        console.log('in onTurnOverHandCards player.lordPosition',player.lordPosition)
        if(player.lordPosition === player.position){
          player.mycards.push(changeCard(card1));
          player.mycards.push(changeCard(card2));
          player.mycards.push(changeCard(card3));
        }
        console.log('in onTurnOverHandCards player.mycards',player.mycards)
        player.knowCards.push(changeCard(card1));
        player.knowCards.push(changeCard(card2));
        player.knowCards.push(changeCard(card3));

    },

    /**
     * 等待指定玩家出牌
     * @param {number} position 玩家位置
     */
    onWaitPlayCards: function (position) {
        log("等待指定玩家出牌");
        log(position);

    },

    /**
     * 询问指定玩家出牌
     * @return {PlayResult} 出牌结果
     */

    onInquirePlayCards: function () {

        console.log("轮到自己出牌");
        var aiLogic = new AILogic(player);
            // try {
                let cardList = [];
                if (player.prev.length === 0) {
                    let result = aiLogic.play(player.mycards.length);
                    if(_.isEmpty(result)) return new PlayResult(MsgResultPlayCardsNo, null);
                    //删出过的牌
                    console.log('before delete out player.mycards', player.mycards)
                    for(let i = 0; i < player.mycards.length; i++){
                        result.cardList.forEach(function(cloneCard){
                            if(player.mycards[i].val === cloneCard.val && player.mycards[i].type === cloneCard.type){
                                player.mycards.splice(i--, 1)
                            }
                        })
                    }
                    console.log('after delete out player.mycards', player.mycards)

                    result.cardList.forEach(function(card){
                        let c = changeAICardToNormal(card);
                        let outCard = new Card(c.style, c.point)
                        cardList.push(outCard)
                    })
                    console.log('in onInquirePlayCards1', cardList)
                    return new PlayResult(MsgResultPlayCardsYes, cardList);
                } else {
                    let cloneCards = player.prev.slice(0), isLandlord;
                    cloneCards.sort(GameRule.cardSort)
                    console.log('in onInquirePlayCards2 cloneCards', cloneCards)

                    let winCard = GameRule.typeJudge(cloneCards);
                    console.log('in onInquirePlayCards2 winCard', winCard)

                    let isWinnerIsLandlord = false;
                    console.log('in onInquirePlayCards2 player.lordPosition', player.lordPosition)
                    console.log('in onInquirePlayCards2 player.roundWinner.position', player.roundWinner.position)
                    if (player.lordPosition == player.roundWinner.position) isWinnerIsLandlord = true;
                    let roundWinnerCardLen;
                    if(isWinnerIsLandlord) {
                        roundWinnerCardLen = this.lordPositionCardsLength;
                    }
                    else {
                        var objects = _.groupBy(player.farmerAllData,function(o){return o['position']});
                        var farmer = [];
                        for(let o in objects){
                            var cardLength = 0, f = {};
                            _.forEach(objects[o], function(object){
                                cardLength += object.cards.length
                            })
                            f.position = o;
                            f.cardLength = cardLength;
                            farmer.push(f);
                        }
                        roundWinnerCardLen = 17-farmer[0].cardLength
                    }
                    let result = aiLogic.follow(winCard, isWinnerIsLandlord, roundWinnerCardLen);
                    console.log('in onInquirePlayCards 2 before change result', result)
                    if(_.isEmpty(result)){
                        return new PlayResult(MsgResultPlayCardsNo, null);
                    }
                    //删出过的牌
                    console.log('before delete out player.mycards', player.mycards)
                    for(let i = 0; i < player.mycards.length; i++){
                        result.cardList.forEach(function(cloneCard){
                            if(player.mycards[i].val === cloneCard.val && player.mycards[i].type === cloneCard.type){
                                player.mycards.splice(i--, 1)
                            }
                        })
                    }
                    console.log('after delete out player.mycards', player.mycards)

                    result.cardList.forEach(function(card){
                        let c = changeAICardToNormal(card);
                        let outCard = new Card(c.style, c.point)
                        cardList.push(outCard)
                    })
                    console.log('in onInquirePlayCards 2 after change result', cardList)
                    return new PlayResult(MsgResultPlayCardsYes, cardList);
                }
            // } catch (e) {
            //     var aiCodeObj = AI.auto(player.transCardsToAi(player.originCards), player.transCardsToAi(player.noChangePrev), player.isLandlord);
            //     var outCard = player.transAiCodeToCard(aiCodeObj.out);
            //     player.originCards = player.transAiCodeToCard(aiCodeObj.leftCards);
            //     player.cardsNeedToAi = aiCodeObj.leftCards;
            //     console.log('AI outCard', outCard, player.transAiCodeToCard(aiCodeObj.leftCards));
        //     }

        // var cards = [];
        // cards.push(new Card(2, 2)) //style point
        // cards.push(new Card(4, 2))
        // console.log('in cards', cards)
        // return new PlayResult(MsgResultPlayCardsYes, cards);
    },

    /*從我的牌里刪除多餘*/
    /**
     * 指定玩家出牌结果
     * @param {number} position 玩家位置
     * @param {number} result 出牌结果
     * @param {number} cards 出牌列表
     */
    onResultOfPlayCards: function (position, result, cards) {
        console.log("指定玩家出牌结果 cards",cards);
        let cloneCards = [];
        _.forEach(cards,function (c,i) {
            cloneCards.push(changeCard(c));
        })
        console.log("指定玩家出牌结果 position",position);
        console.log("指定玩家出牌结果 result",result);
        console.log("指定玩家出牌结果 cloneCards",cloneCards);
        if(this.position != position){
            console.log('in onResultOfPlayCards this.position', this.position)
            player.knowCards.push(cloneCards);
            if(position == player.lordPosition){
                if(this.lordPositionCardsLength==0) this.lordPositionCardsLength = 20-cloneCards.length;
                else this.lordPositionCardsLength -= cloneCards.length;
                console.log('in onResultOfPlayCards lordPositionCardsLength', this.lordPositionCardsLength)
            }else{
                this.farmerAllData.push({position:position, result:result, cards:cloneCards})
                console.log('in onResultOfPlayCards farmerAllData', this.farmerAllData)
            }
            if(cloneCards.length){
                player.prev = cloneCards;
                console.log('in onResultOfPlayCards player.prePosition', player.prePosition)
                player.roundWinner.position = position
                player.roundWinner.cards = cloneCards
                player.prePosition = position;
            }
        }else{
            console.log('in onResultOfPlayCards player.prev', player.prev)
            if(player.prev.length===0) {
                player.roundWinner.position = position
                player.roundWinner.cards = cloneCards
            }

        }
    },

    /**
     * 炸弹
     * @param {number} position 玩家位置
     */
    onBomb: function (position) {
        log("onBomb");
    },

    /**
     * 当前游戏底分和倍数
     * @param {number} base_score 底分
     * @param {number} multiples 倍数
     */
    onBaseScoreAndMultiples: function (base_score, multiples) {
        log("onBaseScoreAndMultiples");
    },

    /**
     * 本局游戏结束
     * @param {boolean} landlord_win 是否地主获胜
     */
    onGameOver: function (landlord_win) {
        this.position = 0, this.mycards = [], this.originCards= [], this.myCardsOut= [], this.countNull= 0, this.knowCards= [],
            this.prev= [], this.othersMayHaveCards= [], this.lordPosition= -1, this.cardsNeedToAi= [], this.callLandlord= 0,
            this.roundWinner= {position:-1, cards: []},this.isLandlord= false, this.winCard= {}, this.prePosition= -1,
            this.farmerAllData= [], this.lordPositionCardsLength= 0, this.farmerAPositionCardsLength= 0, this.farmerBPositionCardsLength= 0,
        log("onGameOver");
    },

    /**
     * 本局游戏玩家得分
     * @param {number} position 玩家位置
     * @param {number} score 玩家得分
     */
    onGameScore: function (position, score) {
        log("onGameScore");
    },
    /**
     * 比赛结束
     */
    onTheEnd: function () {
        log("onTheEnd");
    }
};

var play_game = function (fun_name, data, res) {
    var ret = null;
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
        console.log('play_game')
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
        res.write(json_data);
        console.log('in play_game res.write', json_data);
        res.end();
    } else {
        res.end('');
    }
}

function changeCard(card){
    if(card.style==1) {
        card.style = 2
    } else if(card.style==2) {
        card.style = 1
    }
    let cloneCard = {}
    if (card.style == 5) {
        cloneCard.val = 16;
        cloneCard.type = '0';
    } else if (card.style == 6) {
        cloneCard.val = 17;
        cloneCard.type = '0';
    } else if (card.point == 1) {
        cloneCard.val = 14;
        cloneCard.type = '' + card.style;
    } else if (card.point == 2) {
        cloneCard.val = 15;
        cloneCard.type = '' + card.style;
    } else{
        cloneCard.val = card.point;
        cloneCard.type = '' + card.style;
    }
    return cloneCard;
}

function changeAICardToNormal(card) {
    if(card.type=='1') card.type = '2'
    else if(card.type=='2') card.type = '1'
    let cloneCard = {}
    if (card.val == 16 && card.type == '0') {
        cloneCard.point = 0;
        cloneCard.style = 5
    } else if (card.val == 17 && card.type == '0') {
        cloneCard.point = 0;
        cloneCard.style = 6
    } else if (card.val == 14) {
        cloneCard.point = 1;
        cloneCard.style = Number.parseInt(card.type);
    } else if (card.val == 15) {
        cloneCard.point = 2;
        cloneCard.style = Number.parseInt(card.type);
    } else{
        cloneCard.point = card.val;
        cloneCard.style = Number.parseInt(card.type);
    }
    return cloneCard;
}


http.createServer(function (req, res) {
    var body = '';
    var data = null;
    var fun_name = url.parse(req.url).pathname.substring(1);
    req.on('data', function (data) {
        body += data;
        body = JSON.parse(body);
    });
    req.on('end', function (data) {
        try {
            data = JSON.parse(data);
        } catch (e) {
        }
        play_game(fun_name, body, res);
    });

}).listen(8000, "0.0.0.0");

module.exports = player;