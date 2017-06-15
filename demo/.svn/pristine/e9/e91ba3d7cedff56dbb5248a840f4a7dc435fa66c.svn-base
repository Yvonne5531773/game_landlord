#ifndef __GAME_OBSERVER_IMP_H__
#define __GAME_OBSERVER_IMP_H__


#include "..\Include\kis_com_s\kis_com\KComObject.h"


class CGameObserverImp : public IGameObserver
{
public:
    KAS_BEGIN_COM_MAP(CGameObserverImp)
        KAS_COM_INTERFACE_ENTRY(IGameObserver)
    KAS_END_COM_MAP()

public:
    CGameObserverImp();
    virtual ~CGameObserverImp();

public:
    virtual BOOL Init(DWORD dwPosition);
    virtual BOOL UnInit();

    virtual void MsgHandleCallback(GameMsg* pGameMsg);

private:
    void MsgHandleNewGame(GameMsg* pGameMsg);
    void MsgHandleShuffleCards(GameMsg* pGameMsg);
    void MsgHandleDealCards(GameMsg* pGameMsg);
    void MsgHandleDealCardsToPlayer(GameMsg* pGameMsg);
    void MsgHandleCoverHandCards(GameMsg* pGameMsg);
    void MsgHandlePrepareCallLandlord(GameMsg* pGameMsg);
    void MsgHandleWaitPlayerCallLandlord(GameMsg* pGameMsg);
    void MsgHandleInquirePlayerCallLandlord(GameMsg* pGameMsg);
    void MsgHandleResultOfCallLandlord(GameMsg* pGameMsg);
    void MsgHandleTheLandlord(GameMsg* pGameMsg);
    void MsgHandleTurnOverHandCards(GameMsg* pGameMsg);
    void MsgHandleWaitPlayCards(GameMsg* pGameMsg);
    void MsgHandleInquirePlayCards(GameMsg* pGameMsg);
    void MsgHandleResultOfPlayCards(GameMsg* pGameMsg);
    void MsgHandleBomb(GameMsg* pGameMsg);
    void MsgHandleBaseScoreAndMultiples(GameMsg* pGameMsg);
    void MsgHandleGameOver(GameMsg* pGameMsg);
    void MsgHandleGameScore(GameMsg* pGameMsg);
    void MsgHandleTheEnd(GameMsg* pGameMsg);

private:
    DWORD m_dwPosition;

    std::vector<CCard> m_cardLists;
    DWORD m_dwLandlord;
    DWORD m_dwBaseScore;
    CCard m_lastCard;
    DWORD m_dwLastIndex;
};


#endif //__GAME_OBSERVER_IMP_H__
