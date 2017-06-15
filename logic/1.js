
var _ = require('lodash')

    var a = [ { val: 12, type: '2' },
        { val: 6, type: '1' },
        { val: 17, type: '0' },
        { val: 11, type: '3' },
        { val: 8, type: '3' },
        { val: 4, type: '1' },
        { val: 4, type: '3' },
        { val: 13, type: '2' },
        { val: 14, type: '2' },
        { val: 11, type: '1' },
        { val: 12, type: '4' },
        { val: 12, type: '3' },
        { val: 3, type: '1' },
        { val: 5, type: '1' },
        { val: 10, type: '3' },
        { val: 13, type: '3' },
        { val: 4, type: '4' } ];

var b = [ { val: 12, type: '3' }, { val: 12, type: '4' } ]

var tmpCards = [];
for(let i = 0; i < a.length; i++){
    b.forEach(function(cloneCard){
        if(a[i].val === cloneCard.val && a[i].type === cloneCard.type){
            a.splice(i--, 1)
        }
    })
}
// a.forEach(function(mycard, i){
//     // if(_.includes(b, mycard)) tmpCards.push(mycard)
//     b.forEach(function(cloneCard){
//         if(mycard.val === cloneCard.val && mycard.type === cloneCard.type){
//             a.splice(i--, 1)
//         }
//     })
// })

console.log('delete out tmpCard', a)