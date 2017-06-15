/* -------------------------------------------------------------------------
// 文件名      :	easyipc/EasyIpcCommonWrap.h
// 创建人      :	dingping
// 创建时间    :	2013/4/9 星期二 17:05:44
// 功能描述    :	Easy IPC 客户端/服务端公用包装类
//
// $Id: $
// -----------------------------------------------------------------------*/
#ifndef __EASYIPC_EASYIPCCOMMONWRAP_H__
#define __EASYIPC_EASYIPCCOMMONWRAP_H__

#include "easyipcinterface.h"
#include <shlwapi.h>
#include "include\framework\KRegister2.h"

#pragma comment(lib, "shlwapi.lib")

// -------------------------------------------------------------------------

class KEasyIpcWrap
{
public:
	KEasyIpcWrap() : m_pfnDllQueryInterface(NULL)
	{
		LoadModule();
	}

	~KEasyIpcWrap()
	{
	}

	template<typename Interface>
	Interface* GetInterface()
	{
		Interface* pInterface = NULL; 
		if (m_pfnDllQueryInterface)
			pInterface = (Interface*)m_pfnDllQueryInterface(__uuidof(Interface)); 

		return pInterface;
	}

protected:
	typedef LPVOID (__stdcall *PFNDllQueryInterface)(const IID&);

	BOOL LoadModule(void)
	{
		BOOL bReturn = FALSE;
		HMODULE hModule = NULL;
		LPCTSTR szModuleName = _T("keasyipcn.dll");

		hModule = GetModuleHandle(szModuleName);
		if (!hModule)
		{
			WCHAR szPath[MAX_PATH] = {0}; 
			::GetModuleFileName(NULL, szPath, MAX_PATH); 
			::PathRemoveFileSpec(szPath); 
			::PathAppend(szPath, szModuleName); 
			hModule = LoadLibrary(szPath);
		}

		if (!hModule)
		{
			CString strPath = GetDubaInstallPathFromReg(); 
			strPath.Append(szModuleName); 

			hModule = LoadLibrary(strPath);
			if (!hModule) goto Exit0;
		}

		m_pfnDllQueryInterface = (PFNDllQueryInterface)GetProcAddress(hModule, "DllQueryInterface");
		if (!m_pfnDllQueryInterface) goto Exit0;

		bReturn = TRUE;
Exit0:
		return bReturn;
	}

	CString	GetDubaInstallPathFromReg()
	{
		CString strPath;
		KRegister2 regKey;

		if (FALSE == regKey.Open(HKEY_LOCAL_MACHINE, _T("software\\kingsoft\\antivirus")))
			goto Exit0;

		if (FALSE == regKey.Read(_T("ProgramPath"), strPath))
			goto Exit0;

Exit0:
		return strPath + L"\\"; 
	}

private:
	PFNDllQueryInterface m_pfnDllQueryInterface; 
};

inline easyipc::IEasyIpcBundle* GetEasyIpcBundle(void)
{
	return KEasyIpcWrap().GetInterface<easyipc::IEasyIpcBundle>(); 
}

inline easyipc::IEasyIpcDebug* GetEasyIpcDebug(void)
{
	return KEasyIpcWrap().GetInterface<easyipc::IEasyIpcDebug>(); 
}

class KEasyIpcBundleWrap
{
public:
	KEasyIpcBundleWrap(LPCVOID pData = NULL, int nSize = 0)
	{
		m_pBundle = GetEasyIpcBundle(); 
		m_bManage = TRUE; 

		SetData(pData, nSize); 
	}

	KEasyIpcBundleWrap(easyipc::IEasyIpcBundle* pBundle, BOOL bManage = FALSE)
	{
		m_pBundle = pBundle; 
		m_bManage = bManage; 
	}

	~KEasyIpcBundleWrap()
	{
		if (m_bManage && m_pBundle)
		{
			m_pBundle->Release(); 
			m_pBundle = NULL; 
		}
	}

	operator easyipc::IEasyIpcBundle*(void)
	{
		return m_pBundle; 
	}

	BOOL PushInt(LPCWSTR pszName, int nValue)
	{
		int iRet = -1; 
		if (m_pBundle)
			iRet = m_pBundle->PushInt(pszName, nValue); 

		return iRet == 1 ? TRUE : FALSE; 
	}

	BOOL PushString(LPCWSTR pszName, LPCWSTR pszValue)
	{
		int iRet = -1; 
		if (m_pBundle)
			iRet = m_pBundle->PushString(pszName, pszValue); 

		return iRet == 1 ? TRUE : FALSE; 
	}

	BOOL PushBinary(LPCWSTR pszName, LPCVOID pBuf, int nSize)
	{
		int iRet = -1; 
		if (m_pBundle)
			iRet = m_pBundle->PushBinary(pszName, pBuf, nSize); 

		return iRet == 1 ? TRUE : FALSE; 
	}

	int GetInt(LPCWSTR pszName)
	{
		int iRet = 0; 
		if (m_pBundle)
			iRet = m_pBundle->GetInt(pszName, 0); 

		return iRet; 
	}

	LPCWSTR GetString(LPCWSTR pszName)
	{
		LPCWSTR pszRet = NULL; 
		if (m_pBundle)
			pszRet = m_pBundle->GetString(pszName, NULL); 

		return pszRet; 
	}

	BOOL GetBinary(LPCWSTR pszName, CStringA& strBin)
	{
		BOOL bRet = FALSE; 
		if (m_pBundle)
		{
			int iRet = m_pBundle->GetBinary(pszName, NULL, 0); 
			if (iRet > 0)
			{
				m_pBundle->GetBinary(pszName, strBin.GetBufferSetLength(iRet), iRet); 
				bRet = TRUE; 
			}
		}

		return bRet; 
	}

	BOOL HasValue(LPCWSTR pszName)
	{
		BOOL bRet = FALSE; 

		if (m_pBundle)
			bRet = m_pBundle->HasValue(pszName); 

		return bRet; 
	}

	void Clear(void)
	{
		if (m_pBundle)
			m_pBundle->Clear(); 
	}

	BOOL DeleteValue(LPCWSTR pszName)
	{
		if (m_pBundle)
			return m_pBundle->DeleteValue(pszName); 

		return FALSE; 
	}

	BOOL SetData(LPCVOID pData, int nSize)
	{
		BOOL bRet = FALSE; 
		if (!pData || !nSize)
			goto Exit0; 
		
		if (m_pBundle)
			bRet = m_pBundle->SetDataBuffer(pData, nSize) == 0 ? TRUE : FALSE; 

Exit0:
		return bRet; 
	}

	LPCSTR GetData(int& nSize)
	{
		if (!m_pBundle)
			return NULL; 

		nSize = m_pBundle->GetDataBuffer(NULL, 0); 
		if (nSize > 0)
			m_pBundle->GetDataBuffer(m_strData.GetBufferSetLength(nSize), nSize); 

		return m_strData; 
	}

	easyipc::IEasyIpcBundle* Detach(void)
	{
		m_bManage = FALSE; 
		easyipc::IEasyIpcBundle* pBundle = m_pBundle; 
		m_pBundle = NULL; 
		return pBundle; 
	}

	void CopyTo(easyipc::IEasyIpcBundle* pBundle)
	{
		if (pBundle && m_pBundle)
			m_pBundle->CopyTo(pBundle); 
	}

private:
	easyipc::IEasyIpcBundle* m_pBundle; 
	BOOL                     m_bManage; 
	CStringA                 m_strData; 
};

// -------------------------------------------------------------------------
// $Log: $

#endif /* __EASYIPC_EASYIPCCOMMONWRAP_H__ */
