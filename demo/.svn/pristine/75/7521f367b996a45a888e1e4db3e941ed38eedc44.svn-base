/* -------------------------------------------------------------------------
// 文件名      :	easyipc/EasyIpcServerWrap.h
// 创建人      :	dingping
// 创建时间    :	2013/4/9 星期二 17:06:55
// 功能描述    :	Easy IPC 服务端包装类
//
// $Id: $
// -----------------------------------------------------------------------*/
#ifndef __EASYIPC_EASYIPCSERVERWRAP_H__
#define __EASYIPC_EASYIPCSERVERWRAP_H__

#include "easyipccommonwrap.h"
#include <set>

#include "include\easyipc_new\easyipcinterface.h"
#pragma comment(lib, "keasyipc.lib")
LPVOID __stdcall DllQueryInterface(const IID& iid);

// -------------------------------------------------------------------------


/***********************************************************************
IPC 注册示例：

一.ipc服务端使用方法：
	1.IPC过程定义
	interface ICalculate
	{
		virtual int Sum(easyipc::IEasyIpcBundle* pParam, easyipc::IEasyIpcBundle* pResult) = 0; 
	}; 

	struct KCalculate : public ICalculate
	{
		int Sum(easyipc::IEasyIpcBundle* pParam, easyipc::IEasyIpcBundle* pResult)
		{
			int a = pParam->GetInt(L"a", 0); 
			int b = pParam->GetInt(L"b", 0); 
			pResult->PushInt(L"result", a + b); 
			return 0; 
		}
	}

	2.IPC实例定义
	KCalculate ipcCalc;

	3.注册IPC过程
	EASYIPC_REGISTER_METHOD(ICalculate, Sum, &ipcCalc)

	4.启动、停止ipc方法
	int main()
	{
		// 开始IPC 接口，EASYIPC_START_INTERFACE 需要在 EASYIPC_REGISTER_METHOD(...) 之后调用
		EASYIPC_START_INTERFACE(ICalculate); 

		// ...

		// 停止IPC 接口
		EASYIPC_STOP_INTERFACE(ICalculate); 
	}

	
二.ipc客户端调用方法
	void CallSum(void)
	{
		KEasyIpcClientWrap ipcClient(L"KCalculate"); 

		ipcClient.AddParam(L"a", 1); 
		ipcClient.AddParam(L"b", 2); 
		int nRetCode = ipcClient.Call(L"Run"); 
		if (nRetCode == 0)
		{
			int sum = ipcClient.GetInt(L"result"); 
		}
	}


************************************************************************/

#define EASYIPC_START_INTERFACE(interface) KEasyIpcServerWrap::Instance().Start(L#interface)

#define EASYIPC_STOP_INTERFACE(interface)  KEasyIpcServerWrap::Instance().Stop(L#interface)


#define EASYIPC_REGISTER_METHOD(class, method, obj)                                        \
	static int s_n##class##method = KEasyIpcServerWrap::Instance().Register(               \
		L#class, L#method, EasyIpcExecWrap<class>::CreateObj((obj), &class::method)); 

#define EASYIPC_UNREGISTER(class)                                                          \
	KEasyIpcServerWrap::Instance().Unregister(L#class)


inline easyipc::IEasyIpcServer* GetEasyIpcServer(void)
{
	//return KEasyIpcWrap().GetInterface<easyipc::IEasyIpcServer>(); 
    return (easyipc::IEasyIpcServer*)DllQueryInterface(__uuidof(easyipc::IEasyIpcServer));
}

class KEasyIpcServerWrap
{
public:
	static KEasyIpcServerWrap& Instance(void)
	{
		static KEasyIpcServerWrap ipcServer; 
		return ipcServer; 
	}

	int Register(LPCWSTR pszInterface, LPCWSTR pszFunction, easyipc::IEasyIpcExecObject* pObject)
	{
		int iRet = -1; 

		if (m_pIpcServer)
			iRet = m_pIpcServer->Register(pszInterface, pszFunction, pObject); 

		return iRet; 
	}

	int Unregister(LPCWSTR pszInterface)
	{
		int iRet = -1; 

		if (m_pIpcServer)
			iRet = m_pIpcServer->Unregister(pszInterface); 

		return iRet; 
	}

	int RegardEvent(LPCWSTR pszEventName, easyipc::IEasyEventObject* pObject)
	{
		int iRet = -1; 

		if (m_pIpcServer)
			iRet = m_pIpcServer->RegardEvent(pszEventName, pObject); 

		return iRet; 
	}

	int UnregardEvent(LPCWSTR pszEventName, easyipc::IEasyEventObject* pObject)
	{
		int iRet = -1; 

		if (m_pIpcServer)
			iRet = m_pIpcServer->UnregardEvent(pszEventName, pObject); 

		return iRet; 
	}

	int Start(LPCWSTR pszInterface)
	{
		if (m_pIpcServer)
			return m_pIpcServer->Start(pszInterface); 

		return -1; 
	}

	int Stop(LPCWSTR pszInterface)
	{
		if (m_pIpcServer)
			return m_pIpcServer->Stop(pszInterface); 

		return -1; 
	}

protected:
	KEasyIpcServerWrap(void)
	{
		m_pIpcServer = GetEasyIpcServer(); 
	}

	~KEasyIpcServerWrap(void)
	{
		if (m_pIpcServer)
			m_pIpcServer->Release(); 
	}

private:
	easyipc::IEasyIpcServer* m_pIpcServer; 
};

template<typename classtype>
class EasyIpcExecWrap : public easyipc::IEasyIpcExecObject
{
public:
	typedef int (classtype::*FnRunMethod)(easyipc::IEasyIpcBundle* pParam, easyipc::IEasyIpcBundle* pResult); 

	static easyipc::IEasyIpcExecObject* CreateObj(classtype* pObject, FnRunMethod fnRunMethod)
	{
		if (!pObject || !fnRunMethod)
			return NULL; 

		return new EasyIpcExecWrap(pObject, fnRunMethod); 
	}

protected:
	EasyIpcExecWrap(classtype* pObject, FnRunMethod fnRunMethod)
		: pObj(pObject), fnRun(fnRunMethod)
	{
	}

	virtual void __stdcall Release(void) 
	{
		delete this; 
	}

	virtual int __stdcall Run(easyipc::IEasyIpcBundle* pParam, easyipc::IEasyIpcBundle* pResult) 
	{
		return (pObj->*fnRun)(pParam, pResult); 
	}

private:
	classtype*   pObj; 
	FnRunMethod  fnRun; 
};


// -------------------------------------------------------------------------
// $Log: $

#endif /* __EASYIPC_EASYIPCSERVERWRAP_H__ */
