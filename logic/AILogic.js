/**
 * AI逻辑
 *
 */
var g = require('./GameRule'),
    _ = require('lodash');
var GameRule = new g()

var AILogic = function (p){
    this.player = p;
    this.cards = p.mycards.slice(0).sort(GameRule.cardSort);
    this.analyse();
};

var AICardType = function(v, list){
    this.val = v;
    this.cardList = list;
};
/**
 * 跟牌,AI根据上家牌出牌
 * @method function
 * @param  {object} winc 当前牌面最大牌
 * @param  {boolean} isWinnerIsLandlord 当前最大是否是地主
 * @return {number} winnerCardCount 当前最大那家剩余手牌数
 */
AILogic.prototype.follow = function(winc, isWinnerIsLandlord, winnerCardCount) {
    console.log('in follow isWinnerIsLandlord', isWinnerIsLandlord)
    console.log('in follow winnerCardCount', winnerCardCount)
    var self = this;
    self.log();
    var result = (function(){
        switch (winc.cardKind) {//判断牌型
            case GameRule.ONE://单牌
                console.log('in follow GameRule.ONE self._one', self._one)
                var one = self.matchCards(self._one, GameRule.ONE, winc, isWinnerIsLandlord, winnerCardCount);
                if(!one){
                    if(isWinnerIsLandlord || self.player.isLandlord){
                        console.log('in follow GameRule.ONE isWinnerIsLandlord', isWinnerIsLandlord)
                        console.log('in follow GameRule.ONE self.player.isLandlord', self.player.isLandlord)
                        for (var i = 0; i < self.cards.length; i++) {
                            if(self.cards[i].val <= 15 && self.cards[i].val > winc.val){
                                return {cardList: self.cards.slice(i, i + 1),
                                    cardKind: GameRule.ONE,
                                    size: 1,
                                    val: self.cards[i].val};
                            }
                        }
                    }
                    if(self.times <= 1 && self._pairs.length > 0 && self._pairs[0].val > 10){//剩下一对大于10拆牌
                        var c = self.cards.slice(0, 1);
                        if(c[0].val > winc.val){
                            return {cardList: c,
                                cardKind: GameRule.ONE,
                                size: 1,
                                val: c[0].val};
                        } else {
                            console.log('in follow GameRule.ONE null')
                            return null;
                        }
                    }
                }
                return one;
            case GameRule.PAIRS://对子
                console.log('in follow GameRule.PAIRS self._pairs', self._pairs)
                var pairs =  self._pairs.length > 0 ? self.matchCards(self._pairs, GameRule.PAIRS, winc, isWinnerIsLandlord, winnerCardCount) : null;
                console.log('in follow GameRule.PAIRS pairs', pairs)
                if(pairs == null && (isWinnerIsLandlord || self.player.isLandlord)){//对手需要拆牌大之
                    //从连对中拿对
                    if(self._progressionPairs.length > 0){
                        for (var i = self._progressionPairs.length - 1; i >= 0 ; i--) {
                            if(winc.val >= self._progressionPairs[i].val) continue;
                            for (var j =  self._progressionPairs[i].cardList.length - 1 ; j >= 0; j -= 2) {
                                if(self._progressionPairs[i].cardList[j].val > winc.val){
                                    var pairsFromPP = self._progressionPairs[i].cardList.splice(j - 1,2);
                                    return {cardList: pairsFromPP,
                                            cardKind: GameRule.PAIRS,
                                            size: 2,
                                            val: pairsFromPP[0].val};
                                }
                            }
                        }
                    } else if(self._three.length > 0){
                        for (var i = self._three.length - 1; i >= 0 ; i--) {
                            if(self._three[i].val > winc.val){
                                return {cardList: self._three[i].cardList.slice(0, 2),
                                        cardKind: GameRule.PAIRS,
                                        size: 2,
                                        val: self._three[i].val};
                            }
                        }
                    }
                }
                return pairs;
            case GameRule.THREE://三根
                console.log('in follow GameRule.THREE self._three', self._three)
                if(!isWinnerIsLandlord && !self.player.isLandlord){
                    console.log('in follow GameRule.THREE', isWinnerIsLandlord)
                    console.log('in follow self.player.isLandlord', self.player.isLandlord)
                    return null;
                }
                return self.matchCards(self._three, GameRule.THREE, winc, isWinnerIsLandlord, winnerCardCount);

            case GameRule.THREE_WITH_ONE://三带一
                console.log('in follow GameRule.THREE_WITH_ONE self._three', self._three)
                if(!isWinnerIsLandlord && !self.player.isLandlord){
                    console.log('in follow GameRule.THREE_WITH_ONE', isWinnerIsLandlord)
                    console.log('in follow self.player.isLandlord', self.player.isLandlord)
                    return null;
                }
                var three = self.minCards(self._three, GameRule.THREE, winc.val);
                if(three){
                    var one = self.minOne(2, three.val);
                    if(!one){
                        console.log('in follow GameRule.THREE_WITH_ONE null')
                        return null;
                    } else {
                        three.cardList.push(one);
                    }
                    three.cardKind = GameRule.THREE_WITH_ONE;
                    three.size = 4;
                }
                return three;

            case GameRule.THREE_WITH_PAIRS: //三带一对
                console.log('in follow GameRule.THREE_WITH_PAIRS self._three', self._three)
                if(!isWinnerIsLandlord && !self.player.isLandlord){
                    console.log('in follow GameRule.THREE_WITH_PAIRS', isWinnerIsLandlord)
                    console.log('in follow self.player.isLandlord', self.player.isLandlord)
                    return null;
                }
                var three = self.minCards(self._three, GameRule.THREE, winc.val);
                console.log('in follow GameRule.THREE_WITH_PAIRS three', three)
                if(three){
                    var pairs = self.minCards(self._pairs, GameRule.PAIRS);
                    while (true) {//避免对子三根重叠
                        if(pairs.cardList[0].val === three.val){
                            pairs = self.minCards(self._pairs, GameRule.PAIRS, pairs.cardList[0].val);
                        } else {
                            break;
                        }
                    }
                    if(pairs){
                        three.cardList = three.cardList.concat(pairs.cardList);
                    } else {
                        console.log('in follow GameRule.THREE_WITH_PAIRS null')
                        return null;
                    }
                    three.cardKind = GameRule.THREE_WITH_PAIRS;
                    three.size = 5;
                }
                return three;

            case GameRule.PROGRESSION://顺子
                console.log('in follow GameRule.PROGRESSION self._progression', self._progression)
                if(!isWinnerIsLandlord && !self.player.isLandlord){
                    console.log('in follow GameRule.PROGRESSION', isWinnerIsLandlord)
                    console.log('in follow self.player.isLandlord', self.player.isLandlord)
                    return null;
                }
                if(self._progression.length > 0){
                    for (var i = self._progression.length - 1; i >= 0 ; i--) {//从小值开始判断
                        if(winc.val < self._progression[i].val && winc.size <= self._progression[i].cardList.length){
                            if(winc.size === self._progression[i].cardList.length){
                                return self.setCardKind(self._progression[i], GameRule.PROGRESSION);
                            } else {
                                if(self.player.isLandlord || isWinnerIsLandlord){
                                    var valDiff = self._progression[i].val - winc.val,
                                        sizeDiff = self._progression[i].cardList.length - winc.size;
                                    for (var j = 0; j < sizeDiff; j++) {//拆顺
                                        if(valDiff > 1){
                                            self._progression[i].cardList.shift();
                                            self._progression[i].val--;
                                            valDiff -- ;
                                            continue;
                                        }
                                        self._progression[i].cardList.pop();
                                    }
                                    return self.setCardKind(self._progression[i], GameRule.PROGRESSION);
                                } else {
                                    console.log('in follow GameRule.PROGRESSION null')
                                    return null;
                                }
                            }
                        }
                    }
                }
                return null;

            case GameRule.PROGRESSION_PAIRS://连对
                console.log('in follow GameRule.PROGRESSION_PAIRS self.PROGRESSION_PAIRS', self._progressionPairs)
                if(!isWinnerIsLandlord && !self.player.isLandlord){
                    console.log('in follow GameRule.PROGRESSION_PAIRS', isWinnerIsLandlord)
                    console.log('in follow self.player.isLandlord', self.player.isLandlord)
                    return null;
                }
                if(self._progressionPairs.length > 0){
                    for (var i = self._progressionPairs.length - 1; i >= 0 ; i--) {//从小值开始判断
                        if(winc.val < self._progressionPairs[i].val && winc.size <= self._progressionPairs[i].cardList.length){
                            if(winc.size === self._progressionPairs[i].cardList.length){
                                return self.setCardKind(self._progressionPairs[i], GameRule.PROGRESSION_PAIRS);
                            } else {
                                if(self.player.isLandlord || isWinnerIsLandlord){
                                    var valDiff = self._progressionPairs[i].val - winc.val,
                                        sizeDiff = (self._progressionPairs[i].cardList.length - winc.size) / 2;
                                    for (var j = 0; j < sizeDiff; j++) {//拆顺
                                        if(valDiff > 1){
                                            self._progressionPairs[i].cardList.shift();
                                            self._progressionPairs[i].cardList.shift();
                                            valDiff -- ;
                                            continue;
                                        }
                                        self._progressionPairs[i].cardList.pop();
                                        self._progressionPairs[i].cardList.pop();
                                    }
                                    return self.setCardKind(self._progressionPairs[i], GameRule.PROGRESSION_PAIRS);
                                } else {
                                    console.log('in follow GameRule.PROGRESSION_PAIRS null')
                                    return null;
                                }
                            }
                        }
                    }
                }
                return null;

            case GameRule.PLANE://三顺
                console.log('in follow GameRule.PLANE self.PLANE', winc)
                if(!isWinnerIsLandlord && !self.player.isLandlord){
                    console.log('in follow GameRule.PLANE', isWinnerIsLandlord)
                    console.log('in follow self.player.isLandlord', self.player.isLandlord)
                    return null;
                }
                return self.minPlane(winc.size, winc);
            case GameRule.PLANE_WITH_ONE: //飞机带单
                console.log('in follow GameRule.PLANE_WITH_ONE')
                if(!isWinnerIsLandlord && !self.player.isLandlord){
                    console.log('in follow GameRule.PLANE_WITH_ONE', isWinnerIsLandlord)
                    console.log('in follow self.player.isLandlord', self.player.isLandlord)
                    return null;
                }
                var cnt = winc.size / 4,
                    plane = self.minPlane(cnt * 3, winc);
                console.log('in follow GameRule.PLANE_WITH_ONE winc',winc)
                console.log('in follow GameRule.PLANE_WITH_ONE plane',plane)
                if(plane){
                    var currOneVal = 2;
                    for (var i = 0; i < cnt; i++) {
                        var one = self.minOne(currOneVal, plane.val);//拿一张单牌
                        if(one){
                            plane.cardList.push(one);
                            currOneVal = one.val;
                        } else {
                            return null;
                        }
                    }
                    plane.cardKind = GameRule.PLANE_WITH_ONE;
                    plane.size = plane.cardList.length;
                }
                return plane;
            case GameRule.PLANE_WITH_PAIRS://飞机带对
                console.log('in follow GameRule.PLANE_WITH_PAIRS')
                if(!isWinnerIsLandlord && !self.player.isLandlord){
                    console.log('in follow GameRule.PLANE_WITH_PAIRS', isWinnerIsLandlord)
                    console.log('in follow self.player.isLandlord', self.player.isLandlord)
                    return null;
                }
                var cnt = winc.size / 5,
                    plane = self.minPlane(cnt * 3, winc);
                console.log('in follow GameRule.PLANE_WITH_PAIRS plane',plane)
                console.log('in follow GameRule.PLANE_WITH_PAIRS winc',winc)
                if(plane){
                    var currPairsVal = 2;
                    for (var i = 0; i < cnt; i++) {
                        var pairs = self.minCards(self._pairs, GameRule.PAIRS, currPairsVal);//拿一对
                        if(pairs){
                            plane.cardList = plane.cardList.concat(pairs.cardList);
                            currPairsVal = pairs.val;
                        } else {
                            return null;
                        }
                    }
                    plane.cardKind = GameRule.PLANE_WITH_PAIRS;
                    plane.size = plane.cardList.length;
                }
                return plane;

            case GameRule.BOMB://炸弹
                console.log('in follow GameRule.BOMB self._bomb',self._bomb)
                if(!isWinnerIsLandlord && !self.player.isLandlord){//同是农民不压炸弹
                    console.log('in follow GameRule.BOMB', isWinnerIsLandlord)
                    console.log('in follow self.player.isLandlord', self.player.isLandlord)
                    return null;
                }
                var bomb = self.minCards(self._bomb, GameRule.BOMB, winc.val);
                if(bomb){
                    return bomb;
                } else {
                    if(self._kingBomb.length > 0){
                        if((isWinnerIsLandlord && winnerCardCount < 6)
                            || (self.player.isLandlord && self.player.cardList.length < 6)){
                            return self.setCardKind(self._kingBomb[0], GameRule.KING_BOMB);
                        }
                    }
                    return null;
                }
            case GameRule.FOUR_WITH_TWO:
                console.log('in follow GameRule.FOUR_WITH_TWO self._bomb',self._bomb)
                return self.minCards(self._bomb, GameRule.BOMB, winc.val);
            case GameRule.FOUR_WITH_TWO_PAIRS:
                console.log('in follow GameRule.FOUR_WITH_TWO_PAIRS self._bomb',self._bomb)
                return self.minCards(self._bomb, GameRule.BOMB, winc.val);
            case GameRule.KING_BOMB:
                console.log('in follow GameRule.KING_BOMB self._bomb',self._bomb)
                return null;
            default:
                console.log('in follow default',self)
                return null;
        }
    })();

    //如果有炸弹，根据牌数量确定是否出
    if(result){
        return result;
    } else if(winc.cardKind != GameRule.BOMB && winc.cardKind != GameRule.KING_BOMB
        && (self._bomb.length > 0 || self._kingBomb.length > 0)){
        var objects = _.groupBy(self.player.farmerAllData,function(o){return o['position']});
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
        console.log('in follow farmer',farmer)
        if((isWinnerIsLandlord && winnerCardCount < 5)
            || (self.player.isLandlord && (self.player.mycards.length < 5 || (!_.isEmpty(farmer) && (17-farmer[0].cardLength < 5 || 17-farmer[1].cardLength < 6))))
            || self.times() <= 2){//自己只有两手牌或只有炸弹必出炸弹
            if(self._bomb.length > 0){
                return self.minCards(self._bomb, GameRule.BOMB);
            } else {
                return self.setCardKind(self._kingBomb[0], GameRule.KING_BOMB);
            }
        }
    } else {
        return null;
    }
};

/**
 * 出牌,默认出包含最小牌的牌
 * @method function
 * @return {array} [description]
 */
AILogic.prototype.play = function(landlordCardsCnt) {
    var self = this;
    var cardsWithMin = function (idx){
        var minCard = self.cards[idx];
        console.log('in cardsWithMin minCard', minCard)
        console.log('in cardsWithMin self._one', self._one)
        console.log('in cardsWithMin self._pairs', self._pairs)
        console.log('in cardsWithMin self._three', self._three)
        console.log('in cardsWithMin self._bomb', self._bomb)
        console.log('in cardsWithMin self._plane', self._plane)
        console.log('in cardsWithMin self._progression', self._progression)
        console.log('in cardsWithMin self._progressionPairs', self._progressionPairs)
        console.log('in cardsWithMin self._kingBomb', self._kingBomb)
        //在单根里找
        for (var i = 0; i < self._one.length; i++) {
            console.log('in _one self._one[i].val', self._one[i].val)
            if(self._one[i].val == minCard.val){
                return self.minCards(self._one, GameRule.ONE);
            }
        }
        //对子里找
        for (i = 0; i < self._pairs.length; i++) {
            console.log('in _pairs')
            if(self._pairs[i].val == minCard.val){
                return self.minCards(self._pairs, GameRule.PAIRS);
            }
        }
        //三根里找
        for (i = 0; i < self._three.length; i++) {
            console.log('in _three')
            if(self._three[i].val == minCard.val){
                return self.minCards(self._three, GameRule.THREE);
            }
        }
        //炸弹里找
        for (i = 0; i < self._bomb.length; i++) {
            console.log('in _bomb')
            if(self._bomb[i].val == minCard.val){
                return self.minCards(self._bomb, GameRule.BOMB);
            }
        }
        //三顺里找
        for (i = 0; i < self._plane.length; i++) {
            console.log('in _plane')
            for (var j = 0; j < self._plane[i].cardList.length; j++) {
                if(self._plane[i].cardList[j].val == minCard.val && self._plane[i].cardList[j].type == minCard.type ){
                    return self.minCards(self._plane, GameRule.PLANE);
                }
            }
        }
        //顺子里找
        for (i = 0; i < self._progression.length; i++) {
            console.log('in _progression')
            for (var j = 0; j < self._progression[i].cardList.length; j++) {
                if(self._progression[i].cardList[j].val == minCard.val && self._progression[i].cardList[j].type == minCard.type ){
                    return self.minCards(self._progression, GameRule.PROGRESSION);
                }
            }
        }
        //连对里找
        for (i = 0; i < self._progressionPairs.length; i++) {
            console.log('in _progressionPairs')
            for (var j = 0; j < self._progressionPairs[i].cardList.length; j++) {
                if(self._progressionPairs[i].cardList[j].val == minCard.val && self._progressionPairs[i].cardList[j].type == minCard.type ){
                    return self.minCards(self._progressionPairs, GameRule.PROGRESSION_PAIRS);
                }
            }
        }
        if(self._kingBomb.length > 0){
            console.log('in _kingBomb')
            return self.minCards(self._kingBomb, GameRule.KING_BOMB);
        }
    };
    self.cards.sort(GameRule.cardSort);
    console.log('in playplayplay self.cards', self.cards)
    for (var i = self.cards.length - 1; i >=0 ; i--) {
        var r = cardsWithMin(i);
        console.log('in play rrrrr', r)
        if(r.cardKind === GameRule.ONE){
            if(self._plane.length > 0){//三顺
                var plane = self.minCards(self._plane, GameRule.PLANE);
                var len = plane.cardList.length / 3;
                var currOneVal = 2;
                for (var i = 0; i < len; i++) {
                    var one = self.minOne(currOneVal, plane.val);//拿一张单牌
                    plane.cardList.push(one);
                    currOneVal = one.val;
                }
                return self.setCardKind( plane, GameRule.PLANE_WITH_ONE);
            }
            else if(self._three.length > 0){//三带一
                var three = self.minCards(self._three, GameRule.THREE);
                var len = three.cardList.length / 3;
                var one = self.minOne(currOneVal, three.val);//拿一张单牌
                three.cardList.push(one);
                if(three.val < 14)
                    return self.setCardKind( three, GameRule.THREE_WITH_ONE);
            }
            if(self.player.isLandlord){//坐庄打法
                if(self.player.isLandlord){//坐庄打法
                    var objects = _.groupBy(self.player.farmerAllData,function(o){return o['position']});
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
                    console.log('in self.player.isLandlord farmer', farmer)
                    if(!_.isEmpty(farmer) && (17-farmer[0].cardLength <= 2 || 17-farmer[1].cardLength <= 2 ))
                        return self.playOneAtTheEnd(landlordCardsCnt);
                    else
                        return self.minCards(self._one, GameRule.ONE);
                }
            } else {//偏家打法
                if(landlordCardsCnt <= 2)
                    return self.playOneAtTheEnd(landlordCardsCnt);
                else
                    return self.minCards(self._one, GameRule.ONE);
            }
        } else if(r.cardKind === GameRule.THREE){
            var three = self.minCards(self._three, GameRule.THREE);
            var len = three.cardList.length / 3;
            if(self._one.length >= 0){//单根多带单
                var one = self.minOne(currOneVal, three.val);//拿一张单牌
                three.cardList.push(one);
                return self.setCardKind( three, GameRule.THREE_WITH_ONE);
            } else if(self._pairs.length > 0){
                var pairs = self.minCards(self._pairs, GameRule.PAIRS, currPairsVal);//拿一对
                three.cardList = three.cardList.concat(pairs.cardList);
                return self.setCardKind( three, GameRule.THREE_WITH_PAIRS);
            } else {
                return self.setCardKind( three, GameRule.THREE);
            }
        } else if(r.cardKind === GameRule.PLANE){
            var plane = self.minCards(self._plane, GameRule.PLANE);
            var len = plane.cardList.length / 3;
            if(self._one.length > len && self._pairs.length > len){
                if(self._one.length >= self._pairs.length){//单根多带单
                    var currOneVal = 2;
                    for (var i = 0; i < len; i++) {
                        var one = self.minOne(currOneVal, plane.val);//拿一张单牌
                        plane.cardList.push(one);
                        currOneVal = one.val;
                    }
                    return self.setCardKind( plane, GameRule.PLANE_WITH_ONE);
                } else {
                    var currPairsVal = 2;
                    for (var i = 0; i < len; i++) {
                        var pairs = self.minCards(self._pairs, GameRule.PAIRS, currPairsVal);//拿一对
                        plane.cardList = plane.cardList.concat(pairs.cardList);
                        currPairsVal = pairs.val;
                    }
                    return self.setCardKind( plane, GameRule.PLANE_WITH_PAIRS);
                }
            } else if(self._pairs.length > len){
                var currPairsVal = 2;
                for (var i = 0; i < len; i++) {
                    var pairs = self.minCards(self._pairs, GameRule.PAIRS, currPairsVal);//拿一对
                    plane.cardList = plane.cardList.concat(pairs.cardList);
                    currPairsVal = pairs.val;
                }
                return self.setCardKind( plane, GameRule.PLANE_WITH_PAIRS);
            } else if(self._one.length > len){
                var currOneVal = 2;
                for (var i = 0; i < len; i++) {
                    var one = self.minOne(currOneVal, plane.val);//拿一张单牌
                    plane.cardList.push(one);
                    currOneVal = one.val;
                }
                return self.setCardKind( plane, GameRule.PLANE_WITH_ONE);
            } else {
                return self.setCardKind( plane, GameRule.PLANE);
            }
        }else if(r.cardKind === GameRule.BOMB && self.times() === 1){
            return r;
        } else if(r.cardKind === GameRule.BOMB && self.times() != 1){
            continue;
        } else {
            return r;
        }
    }
};
//出牌将单根放最后出牌
AILogic.prototype.playOneAtTheEnd  = function(landlordCardsCnt) {
    var self = this;
    if(self._progression.length > 0){//出顺子
        return self.minCards(self._progression, GameRule.PROGRESSION);
    }
    else if(self._plane.length > 0){//三顺
        var plane = self.minCards(self._plane, GameRule.PLANE);
        var len = plane.cardList.length / 3;
        if(self._one.length > len && self._pairs.length > len){
            if(self._one.length >= self._pairs.length){//单根多带单
                var currOneVal = 2;
                for (var i = 0; i < len; i++) {
                    var one = self.minOne(currOneVal, plane.val);//拿一张单牌
                    plane.cardList.push(one);
                    currOneVal = one.val;
                }
                return self.setCardKind( plane, GameRule.PLANE_WITH_ONE);
            } else {
                var currPairsVal = 2;
                for (var i = 0; i < len; i++) {
                    var pairs = self.minCards(self._pairs, GameRule.PAIRS, currPairsVal);//拿一对
                    plane.cardList = plane.cardList.concat(pairs.cardList);
                    currPairsVal = pairs.val;
                }
                return self.setCardKind( plane, GameRule.PLANE_WITH_PAIRS);
            }
        } else if(self._pairs.length > len){
            var currPairsVal = 2;
            for (var i = 0; i < len; i++) {
                var pairs = self.minCards(self._pairs, GameRule.PAIRS, currPairsVal);//拿一对
                plane.cardList = plane.cardList.concat(pairs.cardList);
                currPairsVal = pairs.val;
            }
            return self.setCardKind( plane, GameRule.PLANE_WITH_PAIRS);
        } else if(self._one.length > len){
            var currOneVal = 2;
            for (var i = 0; i < len; i++) {
                var one = self.minOne(currOneVal, plane.val);//拿一张单牌
                plane.cardList.push(one);
                currOneVal = one.val;
            }
            return self.setCardKind( plane, GameRule.PLANE_WITH_ONE);
        } else {
            return self.setCardKind( plane, GameRule.PLANE);
        }
    }
    else if(self._progressionPairs.length > 0){//出连对
        return self.minCards(self._progressionPairs, GameRule.PROGRESSION_PAIRS);
    }
    else if(self._three.length > 0){//三根、三带一、三带对
        var three = self.minCards(self._three, GameRule.THREE);
        var len = three.cardList.length / 3;
        if(self._one.length >= 0){//单根多带单
            var one = self.minOne(currOneVal, three.val);//拿一张单牌
            three.cardList.push(one);
            return self.setCardKind( three, GameRule.THREE_WITH_ONE);
        } else if(self._pairs.length > 0){
            var pairs = self.minCards(self._pairs, GameRule.PAIRS, currPairsVal);//拿一对
            three.cardList = three.cardList.concat(pairs.cardList);
            return self.setCardKind( three, GameRule.THREE_WITH_PAIRS);
        } else {
            return self.setCardKind( three, GameRule.THREE);
        }
    }
    else if(self._pairs.length > 0){//对子
        var objects = _.groupBy(self.player.farmerAllData,function(o){return o['position']});
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
        console.log('in playOneAtTheEnd self._pairs.length > 0 farmer',farmer)
        if((self.player.isLandlord && (!_.isEmpty(farmer) && (17-farmer[0].cardLength === 2 || 17-farmer[1].cardLength === 2)))
            || (!self.player.isLandlord && landlordCardsCnt === 2))
            return self.maxCards(self._pairs, GameRule.PAIRS);
        else
            return self.minCards(self._pairs, GameRule.PAIRS);
    }
    else if(self._one.length > 0 ){//出单牌
        var objects = _.groupBy(self.player.farmerAllData,function(o){return o['position']});
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
        console.log('in playOneAtTheEnd self._one.length farmer',farmer)
        if((self.player.isLandlord && (!_.isEmpty(farmer) && (17-farmer[0].cardLength <= 2 || 17-farmer[1].cardLength <= 2)))
            || (!self.player.isLandlord && landlordCardsCnt <= 2))
            return self.maxCards(self._one, GameRule.ONE);
        else
            return self.minCards(self._one, GameRule.ONE);
    } else {//都计算无结果出最小的那张牌
        var one = null;
        var objects = _.groupBy(self.player.farmerAllData,function(o){return o['position']});
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
        console.log('in playOneAtTheEnd 都计算无结果出最小的那张牌 farmer',farmer)
        if((self.player.isLandlord && (!_.isEmpty(farmer) && (17-farmer[0].cardLength <= 2 || 17-farmer[1].cardLength <= 2)))
            || (!self.player.isLandlord && landlordCardsCnt <= 2))
            one = self.cards.slice(self.cards.length - 1, self.cards.length);
        else
            one = self.cards.slice(0, 1);
        return {
            size : 1,
            cardKind: GameRule.ONE,
            cardList: one,
            val: one[0].val
        };
    }
};

/**
 * 玩家出牌提示
 * @method prompt
 * @param  {object} winc 当前牌面最大牌
 * @return {Array}      提示结果
 */
AILogic.prototype.prompt = function (winc){
    var self = this,
        stat = GameRule.valCount(self.cards);

    if(winc){//跟牌
        var promptList = [];
        /**
         * 设置符合条件的提示牌
         * @method function
         * @param  {int} c 几张的牌，比如单牌：1，对子：2
         * @param  {int} winVal 要求大过的值
         * @param  {array} st 牌统计
         */
        var setPrompt = function(c, winVal, st){
            var result = [];
            //除去不能大过当前的牌
            for (var i = st.length - 1; i >= 0; i--) {
                if(st[i].count < c ||st[i].val <= winVal){
                    st.splice(i, 1);
                }
            }
            st.sort(self.promptSort);
            //加入各个符合值的单牌
            for (i = 0; i < st.length; i++) {
                for (j = 0; j < self.cards.length; j++) {
                    if(self.cards[j].val === st[i].val){
                        result.push(self.cards.slice(j, j + c));
                        break;
                    }
                }
            }
            return result;
        };
        /**
         * 获取三顺提示牌
         * @method function
         * @param  {int} n 数量(有几个三根)
         */
        var getPlanePrompt = function (n){
            var result = [];
            if(winc.val < 14 && self.cards.length >= winc.size) {//不是最大顺子才有的比
                for (var i = winc.val + 1; i < 15; i++) {
                    var proList = [];
                    for (var j = 0; j < self.cards.length; j++) {
                        if(self.cards[j].val < i && proList.length === 0) break;
                        if(self.cards[j].val > i || (proList.length > 0 && self.cards[j].val === proList[proList.length - 1].val)){
                            continue;
                        }
                        if(self.cards[j].val === i
                            && self.cards[j + 1]
                            && self.cards[j + 1].val === i
                            && self.cards[j + 2]
                            && self.cards[j + 2].val === i
                            && proList.length === 0) {
                            proList = proList.concat(self.cards.slice(j, j + 3));
                            j += 2;
                            continue;
                        }
                        if(proList.length > 0
                            && proList[proList.length - 1].val - 1 === self.cards[j].val
                            && self.cards[j + 1]
                            && proList[proList.length - 1].val - 1 === self.cards[j + 1].val
                            && self.cards[j + 2]
                            && proList[proList.length - 1].val - 1 === self.cards[j + 2].val){//判定递减
                            proList = proList.concat(self.cards.slice(j, j + 3));
                            j += 2;
                            if(proList.length === n * 3){
                                result.push(proList);
                                break;
                            }
                        } else { break;}
                    }
                }
            }
            return result;
        };
        switch (winc.cardKind) {
            case GameRule.ONE://单牌
                promptList = setPrompt(1, winc.val, stat);
                break;
            case GameRule.PAIRS://对子
                promptList = setPrompt(2, winc.val, stat);
                break;
            case GameRule.THREE://三根
                promptList = setPrompt(3, winc.val, stat);
                break;
            case GameRule.THREE_WITH_ONE://三带一
                var threePrompt = setPrompt(3, winc.val, stat.slice(0)),
                    onePrompt = setPrompt(1, 2, stat.slice(0));
                for (var i = 0; i < threePrompt.length; i++) {
                    for (var j = 0; j < onePrompt.length; j++) {
                        if(onePrompt[j][0].val != threePrompt[i][0].val){
                            promptList.push(threePrompt[i].concat(onePrompt[j]));
                        }
                    }
                }
                break;
            case GameRule.THREE_WITH_PAIRS://三带对
                var threePrompt = setPrompt(3, winc.val, stat.slice(0)),
                    pairsPrompt = setPrompt(2, 2, stat.slice(0));
                for (var i = 0; i < threePrompt.length; i++) {
                    for (var j = 0; j < pairsPrompt.length; j++) {
                        if(pairsPrompt[j][0].val != threePrompt[i][0].val){
                            promptList.push(threePrompt[i].concat(pairsPrompt[j]));
                        }
                    }
                }
                break;
            case GameRule.PROGRESSION://顺子
                if(winc.val < 14 && self.cards.length >= winc.size) {//不是最大顺子才有的比
                    for (var i = winc.val + 1; i < 15; i++) {
                        var proList = [];
                        for (var j = 0; j < self.cards.length; j++) {
                            if(self.cards[j].val < i && proList.length === 0) break;
                            if(self.cards[j].val > i || (proList.length > 0 && self.cards[j].val === proList[proList.length - 1].val)){
                                continue;
                            }
                            if(self.cards[j].val === i && proList.length === 0) {
                                proList.push(self.cards.slice(j, j + 1)[0]);
                                continue;
                            }
                            if(proList[proList.length - 1].val - 1 === self.cards[j].val){//判定递减
                                proList.push(self.cards.slice(j, j + 1)[0]);
                                if(proList.length === winc.size){
                                    promptList.push(proList);
                                    break;
                                }
                            } else { break;}
                        }
                    }
                }
                break;
            case GameRule.PROGRESSION_PAIRS://连对
                if(winc.val < 14 && self.cards.length >= winc.size) {//不是最大顺子才有的比
                    for (var i = winc.val + 1; i < 15; i++) {
                        var proList = [];
                        for (var j = 0; j < self.cards.length; j++) {
                            if(self.cards[j].val < i && proList.length === 0) break;
                            if(self.cards[j].val > i || (proList.length > 0 && self.cards[j].val === proList[proList.length - 1].val)){
                                continue;
                            }
                            if(self.cards[j].val === i && self.cards[j + 1] && self.cards[j + 1].val === i && proList.length === 0) {
                                proList = proList.concat(self.cards.slice(j, j + 2));
                                j++;
                                continue;
                            }
                            if(proList.length > 0
                                && proList[proList.length - 1].val - 1 === self.cards[j].val
                                && self.cards[j + 1]
                                && proList[proList.length - 1].val - 1 === self.cards[j + 1].val){//判定递减
                                proList = proList.concat(self.cards.slice(j, j + 2));
                                j++;
                                if(proList.length === winc.size){
                                    promptList.push(proList);
                                    break;
                                }
                            } else { break;}
                        }
                    }
                }
                break;
            case GameRule.PLANE://三顺
                promptList = getPlanePrompt(winc.size / 3);
                break;
            case GameRule.PLANE_WITH_ONE:
                promptList = getPlanePrompt(winc.size / 4);
                break;
            case GameRule.PLANE_WITH_PAIRS:
                promptList = getPlanePrompt(winc.size / 5);
                break;
            case GameRule.FOUR_WITH_TWO:
                promptList = setPrompt(4, winc.val, stat);
                break;
            case GameRule.FOUR_WITH_TWO_PAIRS:
                promptList = setPrompt(4, winc.val, stat);
                break;
            case GameRule.BOMB:
                promptList = setPrompt(4, winc.val, stat);
                break;
            default:
                break;
        }
        if(winc.cardKind != GameRule.KING_BOMB && winc.cardKind != GameRule.BOMB){
            //炸弹加入
            if(self._bomb.length > 0){
                for (var i = self._bomb.length - 1; i >= 0 ; i--) {
                    promptList.push(self._bomb[i].cardList);
                }
            }
        }
        if(winc.cardKind != GameRule.KING_BOMB){
            //王炸加入
            if(self._kingBomb.length > 0){
                promptList.push(self._kingBomb[0].cardList);
            }
        }
        return promptList;
    } else {//出牌
        var promptList = [];
        for (var i = stat.length - 1; i >= 0; i--) {
            if(i != 0){
                promptList.push(self.cards.splice(self.cards.length - stat[i].count, self.cards.length - 1));
            } else {
                promptList.push(self.cards);
            }
        }
        return promptList;
    }
};

/**
 * 获取指定张数的最小牌值
 * @param  {list} cards - 牌
 * @param  {number} n - 张数
 * @param  {number} n - 需要大过的值
 * @return 值
 */
AILogic.prototype.getMinVal = function(n, v){
    var self = this,
        c = GameRule.valCount(self.cards);
    for (var i = c.length - 1; i >= 0; i--) {
        if(c[i].count === n  && c[i].val > v){
            return self.cards.splice(i, 1);
        }
    }
};

/**
 * 牌型分析
 * @method function
 * @return {[type]} [description]
 */
AILogic.prototype.analyse = function(){
    var self = this, cloneCards = [];
    var target = self.cards.slice(0),//拷贝一份牌来分析
        stat = null,//统计信息
        targetWob = null,//除去炸弹之后的牌组
        targetWobt = null,//除去炸弹、三根之后的牌组
        targetWobp = null,//除去炸弹、顺子之后的牌组
        targetWobpp = null;//除去炸弹、连对之后的牌组
    //定义牌型
    self._one = [];
    self._pairs =[];
    self._kingBomb = [];
    self._bomb = [];
    self._three = [];
    self._plane = [];
    self._progression = [];
    self._progressionPairs = [];
    target.sort(GameRule.cardSort);
    console.log('in analyse after sort target',target)
    //判定王炸
    if(GameRule.isKingBomb(target.slice(0,2))){
        self._kingBomb.push(new AICardType(17, target.splice(0, 2)));
    }
    //判定炸弹
    stat = GameRule.valCount(target);
    for (var i = 0; i < stat.length; i++) {
        if(stat[i].count === 4){
            var list = [];
            self.moveItem(target, list, stat[i].val);
            self._bomb.push(new AICardType(list[0].val, list));
        }
    }
    targetWob = target.slice(0);
    //判定三根，用于判定三顺
    targetWobt = targetWob.slice(0);
    self.judgeThree(targetWobt);
    console.log('in analyse after judgeThree self._three', self._three)
    //判定三顺(飞机不带牌)
    self.judgePlane();
    console.log('in analyse after judgePlane self._three', self._three)
    //把三根加回用于判定顺子
    for (i = 0; i < self._three.length; i++) {
        targetWobt = targetWobt.concat(self._three[i].cardList);
    }
    self._three = [];
    targetWobt.sort(GameRule.cardSort);
    //判定顺子，先确定五连
    targetWobp = targetWobt.slice(0);
    console.log('in analyse targetWobp', targetWobp)
    self.judgeProgression(targetWobp);
    //判断连对
    //targetWobpp = targetWobp.slice(0);
    self.judgeProgressionPairs(targetWobp);
    //判定三根，用于判定三顺
    //targetWobt = targetWob.slice(0);
    self.judgeThree(targetWobp);
    //除去顺子、炸弹、三根后判断对子、单牌
    stat = GameRule.valCount(targetWobp);
    for (i = 0; i < stat.length; i++) {
        if(stat[i].count === 1){//单牌
            for (var j = 0; j < targetWobp.length; j++) {
                if(targetWobp[j].val === stat[i].val){
                    self._one.push(new AICardType(stat[i].val, targetWobp.splice(j,1)));
                }
            }
        } else if(stat[i].count === 2){//对子
            for (var j = 0; j < targetWobp.length; j++) {
                if(targetWobp[j].val === stat[i].val){
                    self._pairs.push(new AICardType(stat[i].val, targetWobp.splice(j,2)));
                }
            }
        }
    }
    self._one.forEach(function(one){
        console.log('in analyse self._one', one.cardList)
    })
    self._pairs.forEach(function(pair){
        console.log('in analyse self._pairs', pair.cardList)
    })
    self._three.forEach(function(three){
        console.log('in analyse self._three', three.cardList)
    })
    self._bomb.forEach(function(bomb){
        console.log('in analyse self._bomb', bomb.cardList)
    })
    self._plane.forEach(function(plane){
        console.log('in analyse self._plane', plane.cardList)
    })
    self._progression.forEach(function(progression){
        console.log('in analyse _progression.', progression.cardList)
    })
    self._progressionPairs.forEach(function(progressionPairs){
        console.log('in analyse self._progressionPairs', progressionPairs.cardList)
    })
    self._kingBomb.forEach(function(kingBomb){
        console.log('in analyse self.kingBomb', kingBomb.cardList)
    })
};

/**
 * 判断给定牌中的三根
 * @method judgeThree
 */
AILogic.prototype.judgeThree = function (cards){
    var self = this,
        stat = GameRule.valCount(cards);
    for (i = 0; i < stat.length; i++) {
        if(stat[i].count === 3){
            var list = [];
            self.moveItem(cards, list, stat[i].val);
            self._three.push(new AICardType(list[0].val, list));
            console.log('in judgeThree self._three',self._three)
        }
    }
};

/**
 * 判断给定牌中的飞机
 * @method judgePlane
 */
AILogic.prototype.judgePlane = function (){
    var self = this;
    if(self._three.length > 1){
        var proList = [];
        for (i = 0; i < self._three.length; i++) {//遍历统计结果
            if(self._three[i].val >= 15) continue;//三顺必须小于2
            if(proList.length == 0){
                proList.push({'obj': self._three[i], 'fromIndex': i});
                continue;
            }
            if(proList[proList.length - 1].val - 1 == self._three[i].val){//判定递减
                proList.push({'obj': self._three[i], 'fromIndex': i});
            } else {
                if(proList.length > 1){//已经有三顺，先保存
                    var planeCards = [];
                    for (var j = 0; j < proList.length; j++) {
                        planeCards = planeCards.concat(proList[j].obj.cardList);
                    }
                    self._plane.push(new AICardType(proList[0].obj.val, planeCards));
                    for (var k = proList.length - 1; k >= 0; k--) {//除去已经被取走的牌
                        self._three.splice(proList[k].fromIndex, 1);
                    }
                }
                //重新计算
                proList = [];
                proList.push({'obj': self._three[i], 'fromIndex': i});
            }
        }
        if(proList.length > 1){//有三顺，保存
            var planeCards = [];
            for (var j = 0; j < proList.length; j++) {
                planeCards = planeCards.concat(proList[j].obj.cardList);
            }
            self._plane.push(new AICardType(proList[0].obj.val, planeCards));
            for (var k = proList.length - 1; k >= 0; k--) {//除去已经被取走的牌
                self._three.splice(proList[k].fromIndex, 1);
            }
        }
    }
};

/**
 * 判断给定牌中的顺子(五连)
 * @method judgeProgression
 * @param  {[array]}         cards 指定的牌
 */
AILogic.prototype.judgeProgression = function (cards){
    var self = this;

    var saveProgression = function (proList){
        var progression = [];
        for (var j = 0; j < proList.length; j++) {
            progression.push(proList[j].obj);
        }
        self._progression.push(new AICardType(proList[0].obj.val, progression));
        for (var k = proList.length - 1; k >= 0; k--) {//除去已经被取走的牌
            cards.splice(proList[k].fromIndex, 1);
        }
    };
    //判定顺子
    if(cards.length >= 5){
        var proList = [];
        for (var i = 0; i < cards.length; i++) {
            if(cards[i].val >= 15) continue;//顺子必须小于2
            if(proList.length == 0){
                proList.push({'obj': cards[i], 'fromIndex': i});
                continue;
            }
            if(proList[proList.length - 1].obj.val - 1 === cards[i].val){//判定递减
                proList.push({'obj': cards[i], 'fromIndex': i});
                if(proList.length === 5) break;
            } else if (proList[proList.length - 1].obj.val === cards[i].val) {//相等跳出本轮
                continue;
            } else {
                if(proList.length >= 5){//已经有顺子，先保存
                    //saveProgression(proList);
                    //proList = [];
                    break;
                } else {
                    //重新计算
                    proList = [];
                    proList.push({'obj': cards[i], 'fromIndex': i});
                }
            }
        }
        if(proList.length === 5){//有顺子，保存
            saveProgression(proList);
            self.judgeProgression(cards);//再次判断顺子
        } else {
            self.joinProgression(cards);
        }
    }
};

/**
 * 将顺子与剩下的牌进行拼接，组成更大的顺子
 * @method judgeProgression
 * @param  {[array]}         cards 指定的牌
 */
AILogic.prototype.joinProgression = function (cards){
    var self = this;
    for (var i = 0; i < self._progression.length; i++) {//拼接其他散牌
        for (var j = 0; j < cards.length; j++) {
            if(self._progression[i].val != 14 && self._progression[i].val === cards[j].val - 1){
                self._progression[i].cardList.unshift(cards.splice(j, 1)[0]);
            } else if(cards[j].val === self._progression[i].val - self._progression[i].cardList.length){
                self._progression[i].cardList.push(cards.splice(j, 1)[0]);
            }
        }
    }
    var temp = self._progression.slice(0);
    for (i = 0; i < temp.length; i++) {//连接顺子
        if( i < temp.length - 1 && temp[i].val - temp[i].cardList.length === temp[i + 1].val){
            self._progression[i].cardList = self._progression[i].cardList.concat(self._progression[i + 1].cardList);
            self._progression.splice( ++i, 1);
        }
    }
};

/**
 * 判断给定牌中的连对
 * @method judgeProgressionPairs
 * @param  {[array]}         cards 指定的牌
 */
AILogic.prototype.judgeProgressionPairs = function (cards){
    var self = this;

    var saveProgressionPairs = function (proList){
        var progressionPairs = [];
        for (var i = proList.length - 1; i >= 0; i--) {//除去已经被取走的牌
            for (var j = 0; j < cards.length; j++) {
                if(cards[j].val === proList[i]){
                    progressionPairs = progressionPairs.concat(cards.splice(j, 2));
                    break;
                }
            }
        }
        progressionPairs.sort(GameRule.cardSort);
        self._progressionPairs.push(new AICardType(proList[0], progressionPairs));
    };
    //判定连对
    if(cards.length >= 6){
        var proList = [];
        var stat = GameRule.valCount(cards);//统计
        for (var i = 0; i < stat.length; i++) {
            if(stat[i].val >= 15){//连对必须小于2
                continue;
            }
            if(proList.length == 0  && stat[i].count >= 2){
                proList.push(stat[i].val);
                continue;
            }
            if(proList[proList.length - 1] - 1 === stat[i].val && stat[i].count >= 2){//判定递减
                proList.push(stat[i].val);
            } else {
                if(proList.length >= 3){//已经有连对，先保存
                    //saveProgressionPairs(proList);
                    //proList = [];
                    break;
                } else {
                    //重新计算
                    proList = [];
                    if(stat[i].count >= 2) proList.push(stat[i].val);
                }
            }
        }
        if(proList.length >= 3){//有顺子，保存
            saveProgressionPairs(proList);
            self.judgeProgressionPairs(cards);
        }
    }
};

/**
 * 将src中对应值的牌数据移到dest中
 */
AILogic.prototype.moveItem = function(src, dest, v){
    for (var i =  src.length - 1; i >= 0; i--) {
        if(src[i].val === v){
            dest.push(src.splice(i, 1)[0]);
        }
    }
};

/**
 * 设置返回牌的类型
 * @method setCardKind
 * @param  {[object]}    obj  对象
 * @param  {[kind]}    kind 牌型
 */
AILogic.prototype.setCardKind = function (obj, kind){
    obj.cardKind = kind;
    obj.size = obj.cardList.length;
    return obj;
};

/**
 * 获取大过当前最大牌的三顺最小值
 * 指定牌张数
 * @return
 */
AILogic.prototype.minPlane = function (len, winc){
    var self = this;
    if(self._plane.length > 0){
        for (var i = self._plane.length - 1; i >= 0 ; i--) {//从小值开始判断
            if(winc.val < self._plane[i].val && len <= self._plane[i].cardList.length){
                if(len === self._plane[i].cardList.length){
                    return self.setCardKind(self._plane[i], GameRule.PLANE);
                } else {
                    var valDiff = self._plane[i].val - winc.val,
                        sizeDiff = (self._plane[i].cardList.length - len) / 3;
                    for (var j = 0; j < sizeDiff; j++) {//拆顺
                        if(valDiff > 1){
                            for (var k = 0; k < 3; k++) {
                                self._plane[i].cardList.shift();
                            }
                            valDiff -- ;
                            continue;
                        }
                        for (var k = 0; k < 3; k++) {
                            self._plane[i].cardList.pop();
                        }
                    }
                    return self.setCardKind(self._plane[i], GameRule.PLANE);
                }
            }
        }
    }
    return null;
};

/**
 * 获取list中大过v的最小的元素
 * @param  {array} list [description]
 * @param  {number} kind    牌型
 * @param  {number} v    要大过的值
 * @return
 */
AILogic.prototype.minCards = function (list, kind, v){
    console.log('获取list中大过v的最小的元素')
    var self = this;
    v = v ? v : 2;
    if(list.length > 0){
        for (var i = list.length - 1; i >= 0 ; i--) {//从小值开始判断
            if(v < list[i].val){
                return self.setCardKind(list[i], kind);
            }
        }
    }
    return null;
};

/**
 * 获取list对应牌型最大
 * @param  {array} list [description]
 * @param  {number} kind    牌型
 * @param  {number} v    要大过的值
 * @return
 */
AILogic.prototype.maxCards = function (list, kind, v){
    console.log('获取list对应牌型最大')
    var self = this,
        max = null;
    if(list.length > 0){
        for (var i = 0; i < list.length ; i++) {//从小值开始判断
            if((max && list[i].val > max.val)|| !max){
                max = list[i];
            }
        }
        return v ? (max.val > v ? self.setCardKind(max, kind) : null) : self.setCardKind(max, kind);
    }
    return null;
};

/**
 * 根据自己是否是庄家，来决定出牌，匹配最大或者最小
 * @method function
 * @param  {[array]} list 出牌列表
 * @return {[number]}      牌型
 * @param  {object} winc 当前牌面最大牌
 * @param  {boolean} isWinnerIsLandlord 当前最大是否是地主
 * @return {number} winnerCardCount 当前最大那家剩余手牌数
 */
AILogic.prototype.matchCards = function(list, kind, winc, isWinnerIsLandlord, winnerCardCount) {
    var self = this;
    console.log('in matchCards self.player.lordPositionCardsLength', self.player.lordPositionCardsLength)
    if(self.player.isLandlord){//坐庄打法
        var objects = _.groupBy(self.player.farmerAllData,function(o){return o['position']});
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
        console.log('in matchCards 坐庄打法', farmer)
        if(!_.isEmpty(farmer) && (17-farmer[0].cardLength < 3 || 17-farmer[1].cardLength < 3 ))
            return self.maxCards(list, kind, winc.val);
        else
            return self.minCards(list, kind, winc.val);
    } else {//偏家打法
        console.log('in matchCards 偏家打法')
        if(isWinnerIsLandlord){//地主大时
            if(winnerCardCount < 3){
                console.log('in matchCards 偏家打法 winnerCardCount',winnerCardCount)
                return self.maxCards(list, kind, winc.val);
            } else {
                return self.minCards(list, kind, winc.val);
            }
        } else {
            var c = null;
            if((self.player.lordPosition-self.player.position==1 || self.player.lordPosition-self.player.position==-2) && self.player.lordPositionCardsLength < 3){
                return self.maxCards(list, kind, winc.val);
            } else {
                c = self.minCards(list, kind, winc.val);
                return c ? (c.val < 14 || self.times() <= 2 ? c : null) : null;
            }
        }
    }
};
/**
 * 从对子或者单牌中获取一张牌
 * @param  {array} list [description]
 * @param  {number} v    需要大过的值
 * * @param  {number} notEq    对子中不允许出现的值
 * @return
 */
AILogic.prototype.minOne = function (v, notEq){
    var self = this,
        one = self.minCards(self._one, GameRule.ONE, v),
        oneFromPairs = self.offPairs(notEq);
    if(!one){//没有单根，找对
        if(oneFromPairs){
            self.deleteOne(oneFromPairs);
            return oneFromPairs;
        } else {
            return null;
        }
    } else {
        if(one.val > 14){//保留2和大小王
            if(oneFromPairs){
                self.deleteOne(oneFromPairs);
                return oneFromPairs;
            } else
                return null;
        } else {
            return one.cardList[0];
        }
    }
    return null;
};

/**
 * 拆对
 * @param  {number} v 要大过的值
 * @param  {number} notEq 不能等于的值
 * @return {card}    拆出来得到的牌
 */
AILogic.prototype.offPairs = function (v, notEq){
    var self = this,
        pairs = self.minCards(self._pairs, GameRule.PAIRS, v);
    if(pairs){
        while (true) {
            if(pairs.cardList[0].val === notEq){
                pairs = self.minCards(self._pairs, GameRule.PAIRS, pairs.cardList[0].val);
            } else {
                break;
            }
        }
    }

    return pairs ? pairs.cardList[0] : null;
};
/*
    删掉一张牌并重新分析
 */
AILogic.prototype.deleteOne = function (card){
    console.log('in deleteOne card', card)
    for (var i = 0; i < this.cards.length; i++) {
        if(this.cards[i].val === card.val && this.cards[i].type === card.type){
            this.cards.splice(i, 1);
        }
    }
    this.analyse();
};
/**
 * 手牌评分,用于AI根据自己手牌来叫分
 * @method function
 * @return {[nmber]} 所评得分
 */
AILogic.prototype.judgeScore = function() {
    var self = this,
        score = 0;
    console.log('in judgeScore self.cards',self.cards)
    score += self._bomb.length * 6;//有炸弹加六分
    if(self._kingBomb.length > 0 ){//王炸8分
        score += 8;
    } else {
        if(self.cards[0].val === 17){
            score += 4;
        } else if(self.cards[0].val === 16){
            score += 3;
        }
    }
    for (var i = 0; i < self.cards.length; i++) {
        if(self.cards[i].val === 15){
            score += 2;
        }
    }
    console.info("手牌评分：" + score);
    if(score >= 7){
        return 3;
    } else if(score >= 5){
        return 2;
    } else if(score >= 3){
        return 1;
    } else {//0相当于不叫
        return 0;
    }
};

//出牌排序
//排序，单牌、对，三根，炸弹从小到大
AILogic.prototype.promptSort = function(a, b){
    if(a.count === b.count){
        return a.val > b.val ? 1 : -1;
    } if(a.count < b.count){
        return -1;
    } else {
        return 1;
    }
}

/**
 * 手数，手牌需要打出几次才能打完
 * @method times
 */
AILogic.prototype.times = function (){
    var self = this;
    var t = this._kingBomb.length +
                this._bomb.length +
                this._progression.length +
                this._progressionPairs.length +
                this._one.length +
                this._pairs.length;
    var threeCount = this._three.length;
    if(this._plane.length > 0){
        for (var i = 0; i < this._plane.length; i++) {
            threeCount += this._plane[i].cardList.length / 3;
        }
    }
    if( threeCount - (this._one.length + this._pairs.length) > 0){
        t += threeCount - (this._one.length + this._pairs.length);
    }
    return t;
};

AILogic.prototype.log = function (){
    // var self = this;
    // console.info('以下显示【' + self.player.name + '】手牌概况，手数：' + self.times() );
    // console.info('王炸');
    // console.info(self._kingBomb);
    // console.info('炸弹');
    // console.info(self._bomb);
    // console.info('三根');
    // console.info(self._three);
    // console.info('飞机');
    // console.info(self._plane);
    // console.info('顺子');
    // console.info(self._progression);
    // console.info('连对');
    // console.info(self._progressionPairs);
    // console.info('单牌');
    // console.info(self._one);
    // console.info('对子');
    // console.info(self._pairs);
};

module.exports = AILogic;