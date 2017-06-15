/* -------------------------------------------------------------------------
// 文件名      :	easyipc/EasyIpcClientWrap.h
// 创建人      :	dingping
// 创建时间    :	2013/4/9 星期二 17:07:55
// 功能描述    :	Easy IPC 客户端包装类
//
// $Id: $
// -----------------------------------------------------------------------*/
#ifndef __EASYIPC_EASYIPCCLIENTWRAP_H__
#define __EASYIPC_EASYIPCCLIENTWRAP_H__

#include "EasyIpcCommonWrap.h"
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
		// 开始IPC 接口，EASYIPC_START_SERVER 需要在 EASYIPC_REGISTER_METHOD(...) 之后调用
		EASYIPC_START_SERVER(); 

		// ...

		// 停止IPC 接口
		EASYIPC_STOP_SERVER(); 
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

inline easyipc::IEasyIpcClient* GetEasyIpcClient(void)
{
	//return KEasyIpcWrap().GetInterface<easyipc::IEasyIpcClient>(); 
    return (easyipc::IEasyIpcClient*)DllQueryInterface(__uuidof(easyipc::IEasyIpcClient));
}

class KEasyIpcClientWrap
{
public:
	KEasyIpcClientWrap(LPCWSTR pszInterface = NULL)
	{
		m_pIpcClient = GetEasyIpcClient(); 
		Connect(pszInterface); 
	}

	~KEasyIpcClientWrap(void)
	{
		if (m_pIpcClient)
		{
			m_pIpcClient->Disconnect(); 
			m_pIpcClient->Release(); 
		}
	}

	int Connect(LPCWSTR pszInterface)
	{
		int iRet = -1; 
		if (m_pIpcClient)
			iRet = m_pIpcClient->Connect(pszInterface); 

		return iRet; 
	}

	int Disconnect(void)
	{
		int iRet = -1; 
		if (m_pIpcClient)
			iRet = m_pIpcClient->Disconnect(); 

		return iRet; 
	}

	BOOL AddParam(LPCWSTR pszName, int nValue)
	{
		return m_bundleParam.PushInt(pszName, nValue); 
	}

	BOOL AddParam(LPCWSTR pszName, LPCWSTR pszValue)
	{
		return m_bundleParam.PushString(pszName, pszValue); 
	}

	BOOL AddParam(LPCWSTR pszName, LPCVOID pBuf, int nSize)
	{
		return m_bundleParam.PushBinary(pszName, pBuf, nSize); 
	}

	BOOL AddParam(easyipc::IEasyIpcBundle* pBundle)
	{
		if (pBundle && m_bundleParam)
			pBundle->CopyTo(m_bundleParam); 

		return TRUE; 
	}

	BOOL HasValue(LPCWSTR pszName)
	{
		return m_bundleResult.HasValue(pszName); 
	}

	int GetInt(LPCWSTR pszName)
	{
		return m_bundleResult.GetInt(pszName); 
	}

	LPCWSTR GetString(LPCWSTR pszName)
	{
		return m_bundleResult.GetString(pszName); 
	}

	BOOL GetBinary(LPCWSTR pszName, CStringA& strBin)
	{
		return m_bundleResult.GetBinary(pszName, strBin); 
	}

	int Call(LPCWSTR pszFunction)
	{
		int iRet = -1; 
		if (!m_pIpcClient || !m_bundleParam || !m_bundleResult)
			goto Exit0; 

		m_bundleResult.Clear(); 
		iRet = m_pIpcClient->CallServer(pszFunction, m_bundleParam, m_bundleResult); 
Exit0:
		if (m_bundleParam)
			m_bundleParam.Clear(); 

		return iRet; 
	}

	BOOL IsServerActive(void)
	{
		if (m_pIpcClient)
			return m_pIpcClient->IsServerActive(); 

		return FALSE; 
	}

protected:
	easyipc::IEasyIpcClient* m_pIpcClient; 
	KEasyIpcBundleWrap       m_bundleParam; 
	KEasyIpcBundleWrap       m_bundleResult; 
};


// -------------------------------------------------------------------------
// $Log: $

#endif /* __EASYIPC_EASYIPCCLIENTWRAP_H__ */
