
var player = require('../player')
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
var array = [ { val: 16, type: '0' },
    { val: 6, type: '4' },
    { val: 8, type: '3' },
    { val: 5, type: '2' },
    { val: 5, type: '4' },
    { val: 7, type: '3' },
    { val: 12, type: '1' },
    { val: 14, type: '4' },
    { val: 6, type: '2' },
    { val: 6, type: '3' },
    { val: 5, type: '1' },
    { val: 11, type: '2' },
    { val: 15, type: '4' },
    { val: 9, type: '2' },
    { val: 14, type: '1' },
    { val: 3, type: '3' },
    { val: 11, type: '4' } ];
var tmp = [];
array.forEach(function(a){
    tmp.push(changeAICardToNormal(a))
})

player.onInit(0)
player.onDealCardsToMe(tmp);
player.onInquirePlayerCallLandlord()
player.onTheLandlord(2)
player.onResultOfPlayCards(2, 5, [ { point: 4, style: 2 },
    { point: 5, style: 1 },
    { point: 6, style: 2 },
    { point: 7, style: 1 },
    { point: 8, style: 1 } ]);

player.onInquirePlayCards()