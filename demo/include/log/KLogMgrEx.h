/* -----------------------------------------------------------------------
 *  File		:	KLogMgrEx.h
 *  Author	    :	hexujun
 *  Datet   	:	2015/5/18 14:51
 *  Brief		:	
 *
 * ----------------------------------------------------------------------
 * ----------------------------------------------------------------------*/

#ifndef __KLogMgrEx__h__
#define __KLogMgrEx__h__
//
///////////////////////////////////////////////////////////////////////////

#pragma warning(disable:4996)

#include "KStreamLogger.h"
//#include "publish/systemopt/KCheckVersion.h"

/*
 * 日志文件名，请在项目内定义对应的变量
 */
extern const wchar_t g_wszLogFileNameEx[];
typedef KStreamLogger<enum_KSL_PATH_OPTION__EXE, g_wszLogFileNameEx> __StreamLogger;

#define LOGSEX_DEBUG		if (KLogMgrEx::s_bNeedWriteLog) KLogMgrEx()

#define LOGSEX				KLogMgrEx()

#ifndef LOGS_DEBUG
#define LOGS_DEBUG LOGSEX_DEBUG
#endif

#ifndef LOGS
#define LOGS << LOGSEX
#endif

namespace LOGMGREX_DATA 
{\
struct HEX 
{
	DWORD m_dwValue;

	HEX(DWORD dwValue = 0) {
		m_dwValue = dwValue;
	}

	HEX(int nValue) {
		m_dwValue = (DWORD)nValue;
	}
};
}

#define HEX_LOG_DATA(dwValue) LOGMGREX_DATA::HEX(dwValue)

class KLogMgrEx
{
public:

	
	KLogMgrEx() : m_streamLogger(__StreamLogger::Instance())
	{
	}

	~KLogMgrEx()
	{
		m_streamLogger << enumLogEnd;
	}

	KLogMgrEx& operator<<(const EM_KSL_FORMAT_CODE& code)
	{
		return *this;
	}

	KLogMgrEx& operator<<(const bool& bVal)
	{
		m_streamLogger << bVal;

		return *this;
	}

	KLogMgrEx& operator<<(const int& nVal)
	{
		m_streamLogger << nVal;

		return *this;
	}

	KLogMgrEx& operator<<(const unsigned int& uVal)
	{
		m_streamLogger << uVal;

		return *this;
	}

	KLogMgrEx& operator<<(const long& lVal)
	{
		m_streamLogger << lVal;

		return *this;
	}

	KLogMgrEx& operator<<(const unsigned long& ulVal)
	{
		m_streamLogger << ulVal;

		return *this;
	}

	KLogMgrEx& operator<<(const unsigned long long& ullVal)
	{
		m_streamLogger << ullVal;

		return *this;
	}

	KLogMgrEx& operator<<(const __int64& n64Val)
	{
		CString strVal;

		strVal.Format(L"%I65d", n64Val);

		return *this << strVal.GetString();
	}

	KLogMgrEx& operator<<(const float& fVal)
	{
		m_streamLogger << fVal;

		return *this;
	}

	KLogMgrEx& operator<<(const double& dbVal)
	{
		m_streamLogger << dbVal;

		return *this;
	}

	KLogMgrEx& operator<<(const wchar_t& wcVal)
	{
		m_streamLogger << wcVal;

		return *this;
	}

	KLogMgrEx& operator<<(const wchar_t* pwszVal)
	{
		m_streamLogger << (pwszVal ? pwszVal : L"");

		return *this;
	}

	KLogMgrEx& operator<<(const std::wstring& strVal)
	{
		return *this << strVal.c_str();
	}

	KLogMgrEx& operator<<(const GUID& guid)
	{
		m_streamLogger << guid;

		return *this;
	}

	KLogMgrEx& operator<<(const LOGMGREX_DATA::HEX& hex)
	{
		CString strHex;

		strHex.Format(L"0x%4X", hex.m_dwValue);
		m_streamLogger << strHex;

		return *this;
	}

public:

	static BOOL NeedWriteLog()
	{
		InitLogFileDir();
		return TRUE;

// 		BOOL bNeed = FALSE;
// 		DWORD dwValue = 0;
// 		CRegKey	   regKey;
// 
// 		LPCTSTR lpKey = _T("Software\\Kingsoft\\antivirus\\sysopt");
// 		KInfoc_Product_Type product = KCheckVersion::Instance().GetCurrentVersion();
// 		if (enum_ProductType_DriverGenius == product)
// 		{
// 			lpKey = _T("SOFTWARE\\MyDrivers\\Drivergenius");
// 		}
// 		else if (enum_ProductType_KProtect == product)
// 		{
// 			lpKey = _T("SOFTWARE\\kbasesrv");
// 		}
// 
// 		LONG lRet = regKey.Open(HKEY_LOCAL_MACHINE, lpKey);
// 		if (lRet != ERROR_SUCCESS) goto Exit0;
// 
// 		lRet = regKey.QueryDWORDValue(L"needWriteLog", dwValue);
// 		if (lRet == ERROR_SUCCESS && dwValue)
// 		{
// 			bNeed = TRUE;
// 		}

//Exit0:
/*		return bNeed;*/
	}

private:

	static void InitLogFileDir()
	{
		TCHAR szPath[MAX_PATH + 1] = { 0 };
		::GetModuleFileName(NULL, szPath, MAX_PATH);
		::PathRemoveFileSpec(szPath);
		::PathAppend(szPath, _T("log"));
		if (!CheckFolderExist(szPath))
		{
			::DeleteFile(szPath);
			::CreateDirectory(szPath, NULL);
		}
	}

	static BOOL CheckFolderExist(LPCTSTR lpszPath)
	{
		WIN32_FIND_DATA  wfd;
		BOOL rValue = FALSE;
		HANDLE hFind = ::FindFirstFile(lpszPath, &wfd);
		if ((hFind != INVALID_HANDLE_VALUE) && (wfd.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY))
		{
			rValue = TRUE;   
		}
		if (hFind && hFind != INVALID_HANDLE_VALUE)
		{
			::FindClose(hFind);
		}
		return rValue;
	}

private:

	__StreamLogger& m_streamLogger;

public:

	static int		s_bNeedWriteLog;
};


__declspec(selectany) int KLogMgrEx::s_bNeedWriteLog = KLogMgrEx::NeedWriteLog();

///////////////////////////////////////////////////////////////////////////
//
#endif // __KLogMgrEx__h__

#pragma warning(default:4996)