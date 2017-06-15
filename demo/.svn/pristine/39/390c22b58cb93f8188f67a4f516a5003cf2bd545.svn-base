#include "stdafx.h"
#include "GameObserverImp.h"
#include <algorithm>


CGameObserverImp::CGameObserverImp()
{
    m_dwPosition = -1;
}

CGameObserverImp::~CGameObserverImp()
{
}

BOOL CGameObserverImp::Init(DWORD dwPosition)
{
    m_dwPosition = dwPosition;
    return TRUE;
}

BOOL CGameObserverImp::UnInit()
{
    return TRUE;
}

void CGameObserverImp::MsgHandleCallback(GameMsg* pGameMsg)
{
    if (!pGameMsg)
        return;

    switch (pGameMsg->dwMsgType)
    {
    case GameMsg::MsgTypeNewGame                   : MsgHandleNewGame(pGameMsg); break;
    case GameMsg::MsgTypeShuffleCards              : MsgHandleShuffleCards(pGameMsg); break;
    case GameMsg::MsgTypeDealCards                 : MsgHandleDealCards(pGameMsg); break;
    case GameMsg::MsgTypeDealCardsToPlayer         : MsgHandleDealCardsToPlayer(pGameMsg); break;
    case GameMsg::MsgTypeCoverHandCards            : MsgHandleCoverHandCards(pGameMsg); break;
    case GameMsg::MsgTypePrepareCallLandlord       : MsgHandlePrepareCallLandlord(pGameMsg); break;
    case GameMsg::MsgTypeWaitPlayerCallLandlord    : MsgHandleWaitPlayerCallLandlord(pGameMsg); break;
    case GameMsg::MsgTypeInquirePlayerCallLandlord : MsgHandleInquirePlayerCallLandlord(pGameMsg); break;
    case GameMsg::MsgTypeResultOfCallLandlord      : MsgHandleResultOfCallLandlord(pGameMsg); break;
    case GameMsg::MsgTypeTheLandlord               : MsgHandleTheLandlord(pGameMsg); break;
    case GameMsg::MsgTypeTurnOverHandCards         : MsgHandleTurnOverHandCards(pGameMsg); break;
    case GameMsg::MsgTypeWaitPlayCards             : MsgHandleWaitPlayCards(pGameMsg); break;
    case GameMsg::MsgTypeInquirePlayCards          : MsgHandleInquirePlayCards(pGameMsg); break;
    case GameMsg::MsgTypeResultOfPlayCards         : MsgHandleResultOfPlayCards(pGameMsg); break;
    case GameMsg::MsgTypeBomb                      : MsgHandleBomb(pGameMsg); break;
    case GameMsg::MsgTypeBaseScoreAndMultiples     : MsgHandleBaseScoreAndMultiples(pGameMsg); break;
    case GameMsg::MsgTypeGameOver                  : MsgHandleGameOver(pGameMsg); break;
    case GameMsg::MsgTypeGameScore                 : MsgHandleGameScore(pGameMsg); break;
    case GameMsg::MsgTypeTheEnd                    : MsgHandleTheEnd(pGameMsg); break;
    default:break;
    }
}

// 广播消息——开始新游戏———————dwSize = 4 * 4;szData = 第几局 + 3 * 座位Id（出牌顺序）
void CGameObserverImp::MsgHandleNewGame(GameMsg* pGameMsg)
{
    m_cardLists.clear();
    m_dwLandlord = -1;
    m_dwBaseScore = 0;
    m_lastCard = CCard();
    m_dwLastIndex = 0;
}

// 广播消息——开始洗牌————————dwSize = 0
void CGameObserverImp::MsgHandleShuffleCards(GameMsg* pGameMsg)
{
}

// 广播消息——开始发牌————————dwSize = 0
void CGameObserverImp::MsgHandleDealCards(GameMsg* pGameMsg)
{
}

// 定向消息——向指定玩家发牌—————dwSize = 4 + 17 * 8；szData = 座位Id + 17张牌
void CGameObserverImp::MsgHandleDealCardsToPlayer(GameMsg* pGameMsg)
{
    DWORD* pData = (DWORD*)pGameMsg->szData;
    DWORD dwPositionId = pData[0];
    pData++;

    DWORD dwCardNum = (pGameMsg->dwSize - sizeof(DWORD)) / (2 * sizeof(DWORD));

    m_cardLists.clear();
    for (DWORD i = 0; i < dwCardNum; i++)
    {
        CCard card((CCard::CardStyle)pData[2 * i], (CCard::CardPoint)pData[2 * i + 1]);
        m_cardLists.push_back(card);
    }
}

// 广播消息——盖下底牌————————dwSize = 0
void CGameObserverImp::MsgHandleCoverHandCards(GameMsg* pGameMsg)
{
}

// 广播消息——准备叫地主———————dwSize = 0
void CGameObserverImp::MsgHandlePrepareCallLandlord(GameMsg* pGameMsg)
{
}

// 广播消息——等待指定玩家叫地主———dwSize = 4 + 4；szData = 座位Id + 当前底分（1、2、3）
void CGameObserverImp::MsgHandleWaitPlayerCallLandlord(GameMsg* pGameMsg)
{
    DWORD* pData = (DWORD*)pGameMsg->szData;

    DWORD dwPositionId = pData[0];
    m_dwBaseScore = pData[1];
}

// 请求消息——询问指定玩家叫地主———dwSize = 4 + 4；szData = 结果(参见MsgResult) + 底分（1、2、3）
void CGameObserverImp::MsgHandleInquirePlayerCallLandlord(GameMsg* pGameMsg)
{
    DWORD* pData = (DWORD*)pGameMsg->szData;

    pData[0] = GameMsg::MsgResultCallLandlordYes;
    pData[1] = m_dwBaseScore + 1;
}

// 广播消息——指定玩家叫地主的结果——dwSize = 4 + 4 + 4；szData = 座位Id + 结果(参见MsgResult)+ 底分（1、2、3）
void CGameObserverImp::MsgHandleResultOfCallLandlord(GameMsg* pGameMsg)
{
}

// 广播消息——谁是地主————————dwSize = 4；szData = 座位Id（-1表示没人是地主）
void CGameObserverImp::MsgHandleTheLandlord(GameMsg* pGameMsg)
{
    DWORD* pData = (DWORD*)pGameMsg->szData;

    m_dwLandlord = pData[0];
    m_dwLastIndex = m_dwLandlord;
}

// 广播消息——亮出底牌————————dwSize = 3 * 8；szData = 3张牌
void CGameObserverImp::MsgHandleTurnOverHandCards(GameMsg* pGameMsg)
{
    DWORD* pData = (DWORD*)pGameMsg->szData;

    if (m_dwPosition == m_dwLandlord)
    {
        DWORD dwCardNum = pGameMsg->dwSize / (2 * sizeof(DWORD));

        for (DWORD i = 0; i < dwCardNum; i++)
        {
            CCard card((CCard::CardStyle)pData[2 * i], (CCard::CardPoint)pData[2 * i + 1]);
            m_cardLists.push_back(card);
        }
    }

    sort(m_cardLists.begin(), m_cardLists.end());
}

// 广播消息——等待指定玩家出牌————dwSize = 4；szData = 座位Id
void CGameObserverImp::MsgHandleWaitPlayCards(GameMsg* pGameMsg)
{
}

// 请求消息——询问指定玩家出牌————dwSize = 4 + n * 8；szData = 出牌结果 + n张牌
void CGameObserverImp::MsgHandleInquirePlayCards(GameMsg* pGameMsg)
{
    DWORD* pData = (DWORD*)pGameMsg->szData;

    for (std::vector<CCard>::iterator iter = m_cardLists.begin(); iter != m_cardLists.end(); iter++)
    {
        if (m_dwPosition == m_dwLastIndex || *iter > m_lastCard)
        {
            pGameMsg->dwSize = sizeof(DWORD) + 2 * sizeof(DWORD);
            pData[0] = GameMsg::MsgResultPlayCardsYes;
            pData[1] = iter->style;
            pData[2] = iter->point;

            m_cardLists.erase(iter);
            return;
        }
    }

    pGameMsg->dwSize = sizeof(DWORD);
    pData[0] = GameMsg::MsgResultPlayCardsNo;
}

// 广播消息——指定玩家出牌结果————dwSize = 4 + 4 + n * 8；szData = 座位Id + 出牌结果 + n张牌
void CGameObserverImp::MsgHandleResultOfPlayCards(GameMsg* pGameMsg)
{
    DWORD* pData = (DWORD*)pGameMsg->szData;
    DWORD dwPositionId = pData[0];
    DWORD dwResult = pData[1];
    pData += 2;

    DWORD dwCardNum = (pGameMsg->dwSize - sizeof(DWORD) - sizeof(DWORD)) / (2 * sizeof(DWORD));

    std::vector<CCard> cardList;
    for (DWORD i = 0; i < dwCardNum; i++)
    {
        CCard card((CCard::CardStyle)pData[2 * i], (CCard::CardPoint)pData[2 * i + 1]);
        cardList.push_back(card);
    }

    if (dwResult == GameMsg::MsgResultPlayCardsYes || dwResult == GameMsg::MsgResultPlayCardsInvalidForce || dwResult == GameMsg::MsgResultPlayCardsTimeoutForce)
    {
        m_lastCard = cardList.size() > 0 ? cardList[0] : CCard();
        m_dwLastIndex = dwPositionId;
    }
}

// 广播消息——炸弹——————————dwSize = 4；szData = 座位Id
void CGameObserverImp::MsgHandleBomb(GameMsg* pGameMsg)
{
}

// 广播消息——当前游戏底分和倍数———dwSize = 4 + 4；szData = 当前底分 + 当前倍数
void CGameObserverImp::MsgHandleBaseScoreAndMultiples(GameMsg* pGameMsg)
{
}

// 广播消息——本局游戏结束——————dwSize = 4；szData = 胜利者（1地主胜利，2农民胜利）
void CGameObserverImp::MsgHandleGameOver(GameMsg* pGameMsg)
{
}

// 广播消息——本局游戏玩家得分————dwSize = 4 + 4；szData = 座位Id + 分数
void CGameObserverImp::MsgHandleGameScore(GameMsg* pGameMsg)
{
}

// 广播消息——比赛结束————————dwSize = 0
void CGameObserverImp::MsgHandleTheEnd(GameMsg* pGameMsg)
{
}
