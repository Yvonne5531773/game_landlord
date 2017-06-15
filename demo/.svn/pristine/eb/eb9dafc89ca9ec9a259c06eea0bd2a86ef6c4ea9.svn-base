/********************************************************************
* @file      : IGameObserver.h
* @author    : by wuchengmao
* @date      : 2016/5/3
* @brief     : 定义界面、游戏客户端与游戏引擎的通信接口
*********************************************************************/

#ifndef __IGAME_OBSERVER_H__
#define __IGAME_OBSERVER_H__

#include <Unknwn.h>


typedef struct _GameMsg
{
    // 广播消息：所有玩家和界面都能收到
    // 定向消息：指定玩家和界面才能收到
    // 请求消息：只有指定玩家才能收到，并且需要在指定时间内返回处理结果
    enum MsgType
    {
        MsgTypeNewGame,                     // 广播消息——开始新游戏———————dwSize = 4 * 4;szData = 第几局 + 3 * 座位Id（出牌顺序）
        MsgTypeShuffleCards,                // 广播消息——开始洗牌————————dwSize = 0
        MsgTypeDealCards,                   // 广播消息——开始发牌————————dwSize = 0
        MsgTypeDealCardsToPlayer,           // 定向消息——向指定玩家发牌—————dwSize = 4 + 17 * 8；szData = 座位Id + 17张牌
        MsgTypeCoverHandCards,              // 广播消息——盖下底牌————————dwSize = 0
        MsgTypePrepareCallLandlord,         // 广播消息——准备叫地主———————dwSize = 0
        MsgTypeWaitPlayerCallLandlord,      // 广播消息——等待指定玩家叫地主———dwSize = 4 + 4；szData = 座位Id + 当前底分（1、2、3）
        MsgTypeInquirePlayerCallLandlord,   // 请求消息——询问指定玩家叫地主———dwSize = 4 + 4；szData = 结果(参见MsgResult) + 底分（1、2、3）
        MsgTypeResultOfCallLandlord,        // 广播消息——指定玩家叫地主的结果——dwSize = 4 + 4 + 4；szData = 座位Id + 结果(参见MsgResult)+ 底分（1、2、3）
        MsgTypeTheLandlord,                 // 广播消息——谁是地主————————dwSize = 4；szData = 座位Id（-1表示没人是地主）
        MsgTypeTurnOverHandCards,           // 广播消息——亮出底牌————————dwSize = 3 * 8；szData = 3张牌
        MsgTypeWaitPlayCards,               // 广播消息——等待指定玩家出牌————dwSize = 4；szData = 座位Id
        MsgTypeInquirePlayCards,            // 请求消息——询问指定玩家出牌————dwSize = 4 + n * 8；szData = 出牌结果 + n张牌
        MsgTypeResultOfPlayCards,           // 广播消息——指定玩家出牌结果————dwSize = 4 + 4 + n * 8；szData = 座位Id + 出牌结果 + n张牌
        MsgTypeBomb,                        // 广播消息——炸弹——————————dwSize = 4；szData = 座位Id
        MsgTypeBaseScoreAndMultiples,       // 广播消息——当前游戏底分和倍数———dwSize = 4 + 4；szData = 当前底分 + 当前倍数
        MsgTypeGameOver,                    // 广播消息——本局游戏结束——————dwSize = 4；szData = 胜利者（1地主胜利，2农民胜利）
        MsgTypeGameScore,                   // 广播消息——本局游戏玩家得分————dwSize = 4 + 4；szData = 座位Id + 分数
        MsgTypeTheEnd,                      // 广播消息——比赛结束————————dwSize = 0
    };

    enum MsgResult
    {
        MsgResultNone = 0,                  // 默认值
        MsgResultTimeout,                   // 玩家超时
        MsgResultInvalidOperation,          // 玩家操作不符合规则
        MsgResultCallLandlordYes,           // 玩家叫地主
        MsgResultCallLandlordNo,            // 玩家不叫地主
        MsgResultPlayCardsYes,              // 玩家出牌
        MsgResultPlayCardsNo,               // 玩家不出牌
        MsgResultPlayCardsInvalidPass,      // 玩家因出牌不符合规则，被强制跳过本次出牌
        MsgResultPlayCardsInvalidForce,     // 玩家因出牌不符合规则，被强制出一张牌
        MsgResultPlayCardsTimeoutPass,      // 玩家因操作超时，被强制跳过本次出牌
        MsgResultPlayCardsTimeoutForce      // 玩家因操作超时，被强制出一张牌
    };

    DWORD dwMsgType;
    DWORD dwSize;
    BYTE szData[1];
}GameMsg;


[
    uuid("1E264764-B37B-41f5-A476-3AD17456CF5E")
]
class IGameObserver : public IUnknown
{
public:
    virtual BOOL Init(DWORD dwPosition) = 0;
    virtual BOOL UnInit() = 0;

    virtual void MsgHandleCallback(GameMsg* pGameMsg) = 0;
};

class IGameObserverUI
{
public:
    virtual void MsgHandleCallback(GameMsg* pGameMsg) = 0;
};


#endif //__IGAME_OBSERVER_H__
