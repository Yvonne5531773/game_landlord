/* -------------------------------------------------------------------------
// 文件名      :	easyipc/easyipceventwrap.h
// 创建人      :	dingping
// 创建时间    :	2013/9/4 星期三 20:28:46
// 功能描述    :	
//
// $Id: $
// -----------------------------------------------------------------------*/
#ifndef __EASYIPC_EASYIPCEVENTWRAP_H__
#define __EASYIPC_EASYIPCEVENTWRAP_H__

#include "EasyIpcClientWrap.h"
#include "EasyIpcServerWrap.h"

// -------------------------------------------------------------------------

/***********************************************************************
IPC 事件使用示例：

/******* 事件触发 *******
// 1. 定义事件对象
KEasyIpcEventTrigger eventTrigger; 

// 2. 添加事件参数
eventTrigger.AddParam(L"a", L"abc"); 
eventTrigger.AddParam(L"b", 1); 

// 3. 同步触发事件，函数返回时所有监听者已收到事件通知
eventTrigger.TriggerEvent(L"abc"); 

eventTrigger.AddParam(L"a", L"1234"); 
// 4. 异步触发事件，函数返回时监听者不一定收到通知
eventTrigger.TriggerEvent(L"123", TRUE); 

// 5. 如果是异步触发事件，需要在对象退出时等待事件推送完成
// ，否则监听者可能无法收到事件通知
eventTrigger.WaitEventPusherEnd(); 


/******* 事件监听 *******
KCalculate ipcEvent; 

// 事件响应函数原型
void CLASSTYPE::OnEvent(LPCWSTR pszEventName, easyipc::IEasyIpcBundle* pParam); 

// 关注事件          事件名  事件触发回调          事件接收对象
EASYIPC_REGARD_EVENT(L"abc", &KCalculate::OnEvent, &ipcEvent); 
EASYIPC_REGARD_EVENT(L"123", &KCalculate::OnEvent, &ipcEvent); 

system("pause"); 

// 取消事件关注
EASYIPC_UNREGARD_EVENT(L"abc", &KCalculate::OnEvent, &ipcEvent); 
EASYIPC_UNREGARD_EVENT(L"123", &KCalculate::OnEvent, &ipcEvent); 

************************************************************************/

#define EASYIPC_REGARD_EVENT(name, method, obj)                                            \
	KEasyIpcServerWrap::Instance().RegardEvent(                                            \
		name, CreateEventObj((obj), (method)))

#define EASYIPC_UNREGARD_EVENT(name, method, obj)                                          \
	KEasyIpcServerWrap::Instance().UnregardEvent(                                          \
		name, CreateEventObj((obj), (method)))

class KEasyIpcEventTrigger : public KEasyIpcClientWrap
{
public:
	/*
	@fn     TriggerEvent
	@brief  触发事件
	@arg    pszEventName  事件名
	@arg    bAsyn         是否异步触发，一般同步触发即可，除非对性能要求特别高。
	@                     异步触发的话，退出时需要WaitEventPusherEnd，否则有可
	@                     能导致监听者收不到通知
	@return 0：成功，否则失败
	@remark 不管是同步还是异步，都只是发送完数据便返回，不会等待监听者回调函数执行完成；
	@*/
	int TriggerEvent(LPCWSTR pszEventName, BOOL bAsyn = FALSE)
	{
		int iRet = -1; 
		easyipc::IEasyEventCallback* pCallback = NULL; 
		if (!m_pIpcClient || !m_bundleParam)
			goto Exit0; 

		m_bundleResult.Clear(); 
		iRet = m_pIpcClient->TriggerEvent(pszEventName, m_bundleParam, pCallback, bAsyn); 
Exit0:
		if (m_bundleParam)
			m_bundleParam.Clear(); 

		return iRet; 
	}

	/*
	@fn     TriggerEvent
	@brief  触发事件
	@arg    pszEventName  事件名
	@arg    pThis         事件回调this指针
	@arg    fnRunMethod   事件回调函数，每一个事件响应触发一次回调
	@arg    bAsyn         同上
	@return 0：成功，否则失败
	@remark 
	@*/
	template<typename classtype>
	int TriggerEvent(LPCWSTR pszEventName, 
		classtype* pThis, 
		BOOL (classtype::*fnRunMethod)(LPCWSTR , easyipc::IEasyIpcBundle*), 
		BOOL bAsyn = FALSE)
	{
		int iRet = -1; 
		easyipc::IEasyEventCallback* pCallback = NULL; 
		if (!m_pIpcClient || !m_bundleParam)
			goto Exit0; 

		if (pThis && fnRunMethod)
			pCallback = CreateEventCallback(pThis, fnRunMethod); 

		m_bundleResult.Clear(); 
		iRet = m_pIpcClient->TriggerEvent(pszEventName, m_bundleParam, pCallback, bAsyn); 
Exit0:
		if (m_bundleParam)
			m_bundleParam.Clear(); 

		return iRet; 
	}

	/*
	@fn     WaitEventPusherEnd
	@brief  等待事件推送完成，用于异步触发事件
	@arg    dwMilliseconds  等待时长
	@return 非0成功，反之失败
	@remark 
	@*/
	BOOL WaitEventPusherEnd(DWORD dwMilliseconds = INFINITE)
	{
		if (m_pIpcClient)
			return m_pIpcClient->WaitEventPusherEnd(dwMilliseconds); 

		return FALSE; 
	}
};

template<typename classtype>
class EasyEventWrap : public easyipc::IEasyEventObject
{
public:
	typedef void (classtype::*FnRunMethod)(LPCWSTR pszEventName, easyipc::IEasyIpcBundle* pParam, easyipc::IEasyIpcBundle* pResult); 

	EasyEventWrap(classtype* pObject, FnRunMethod fnRunMethod)
		: pObj(pObject), fnRun(fnRunMethod)
	{
	}

protected:
	virtual void __stdcall Release(void) 
	{
		delete this; 
	}

	virtual void __stdcall Run(LPCWSTR pszEventName, easyipc::IEasyIpcBundle* pParam, easyipc::IEasyIpcBundle* pResult)
	{
		return (pObj->*fnRun)(pszEventName, pParam, pResult); 
	}

	virtual BOOL __stdcall Equal( IEasyEventObject* pEventObject ) const
	{
		EasyEventWrap<classtype>* pEvent = (EasyEventWrap<classtype>*)pEventObject; 

		return pObj == pEvent->pObj && fnRun == pEvent->fnRun; 
	}

private:
	classtype*   pObj; 
	FnRunMethod  fnRun; 
};

template<typename classtype>
static easyipc::IEasyEventObject* CreateEventObj(classtype* pObject, 
												 void (classtype::*fnRunMethod)(LPCWSTR, easyipc::IEasyIpcBundle*, easyipc::IEasyIpcBundle*))
{
	if (!pObject || !fnRunMethod)
		return NULL; 

	return new EasyEventWrap<classtype>(pObject, fnRunMethod); 
}

template<typename classtype>
class EasyEventCallback : public easyipc::IEasyEventCallback
{
public:
	typedef BOOL (classtype::*FnRunMethod)(LPCWSTR pszEventName, easyipc::IEasyIpcBundle* pParam); 

	EasyEventCallback(classtype* pObject, FnRunMethod fnRunMethod)
		: pObj(pObject), fnRun(fnRunMethod)
	{
	}

protected:
	virtual void __stdcall Release(void) 
	{
		delete this; 
	}

	virtual BOOL __stdcall Run(LPCWSTR pszEventName, easyipc::IEasyIpcBundle* pParam)
	{
		return (pObj->*fnRun)(pszEventName, pParam); 
	}

private:
	classtype*   pObj; 
	FnRunMethod  fnRun; 
};

template<typename classtype>
static easyipc::IEasyEventCallback* CreateEventCallback(classtype* pObject, 
												 BOOL (classtype::*fnRunMethod)(LPCWSTR, easyipc::IEasyIpcBundle*))
{
	if (!pObject || !fnRunMethod)
		return NULL; 

	return new EasyEventCallback<classtype>(pObject, fnRunMethod); 
}


// -------------------------------------------------------------------------
// $Log: $

#endif /* __EASYIPC_EASYIPCEVENTWRAP_H__ */
