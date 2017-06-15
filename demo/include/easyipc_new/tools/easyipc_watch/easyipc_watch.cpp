// easyipc_watch.cpp : Defines the entry point for the console application.
//

#include "stdafx.h"
#include <Windows.h>
#include <atlstr.h>
#include "include\easyipc_new\easyipccommonwrap.h"
#include <locale.h>
#include <Psapi.h>
#include <vector>
#include "kis\src\easyipc\commondef.h"

#pragma comment(lib, "psapi.lib")

CString GetProcessName(DWORD nPid)  
{
	HANDLE hProcess = NULL;  

	hProcess = ::OpenProcess(PROCESS_QUERY_INFORMATION, FALSE, nPid); 
	if (!hProcess)
		return L""; 

	WCHAR szPath[MAX_PATH] = { 0 }; 
	::GetProcessImageFileName(hProcess, szPath, _countof(szPath)); 
	::CloseHandle(hProcess); 

	return ::PathFindFileName(szPath); 
}

class KConsoleWriter
{
public:
	struct ConsoleLine
	{
		CStringA strText; 
		WORD     wAttributes; 
	};

public:
	KConsoleWriter()
	{
	}

	void AddLine(LPCSTR pszText, WORD wAttributes = FOREGROUND_RED | FOREGROUND_GREEN | FOREGROUND_BLUE)
	{
		ConsoleLine line; 
		line.strText = pszText; 
		line.strText.AppendChar('\n'); 
		line.wAttributes = wAttributes; 
		m_vcText.push_back(line); 
	}

	void AddErrorLine(LPCSTR pszText)
	{
		return AddLine(pszText, FOREGROUND_INTENSITY | FOREGROUND_RED); 
	}

	void AddString(LPCSTR pszText, WORD wAttributes = FOREGROUND_RED | FOREGROUND_GREEN | FOREGROUND_BLUE)
	{
		ConsoleLine line; 
		line.strText = pszText; 
		line.wAttributes = wAttributes; 
		m_vcText.push_back(line); 
	}

	void Write()
	{
		HANDLE hOutBuf = ::CreateConsoleScreenBuffer(
			GENERIC_READ | GENERIC_WRITE, 
			FILE_SHARE_READ | FILE_SHARE_WRITE, 
			NULL, 
			CONSOLE_TEXTMODE_BUFFER, 
			NULL
			);

		HANDLE hStdout = ::GetStdHandle(STD_OUTPUT_HANDLE); 
		CONSOLE_SCREEN_BUFFER_INFO cbuf; 
		::GetConsoleScreenBufferInfo(hStdout, &cbuf); 
		::SetConsoleScreenBufferSize(hOutBuf, cbuf.dwSize); 

		for (size_t i = 0; i < m_vcText.size(); i++)
		{
			SetColor(hOutBuf, m_vcText[i].wAttributes); 
			::WriteConsoleA(hOutBuf, m_vcText[i].strText, m_vcText[i].strText.GetLength(), NULL, NULL); 
		}

		for (int i = 100; i <= cbuf.dwSize.Y; i += 100)
		{
			COORD coordBufSize; 
			coordBufSize.X = cbuf.dwSize.X; 
			coordBufSize.Y = 100; 
			CHAR_INFO* chiBuffer = new CHAR_INFO[coordBufSize.X * coordBufSize.Y]; 

			SMALL_RECT srctReadRect; 
			srctReadRect.Top = i - 100; 
			srctReadRect.Left = 0; 
			srctReadRect.Bottom = i; 
			srctReadRect.Right = cbuf.dwSize.X; 

			COORD coordBufCoord; 
			coordBufCoord.X = 0; 
			coordBufCoord.Y = 0; 

			BOOL fSuccess = ::ReadConsoleOutput( 
				hOutBuf,        // screen buffer to read from 
				chiBuffer,      // buffer to copy into 
				coordBufSize,   // col-row size of chiBuffer 
				coordBufCoord,  // top left dest. cell in chiBuffer 
				&srctReadRect); // screen buffer source rectangle 

			fSuccess = ::WriteConsoleOutput( 
				hStdout,        // screen buffer to write to 
				chiBuffer,      // buffer to copy from 
				coordBufSize,   // col-row size of chiBuffer 
				coordBufCoord,  // top left src cell in chiBuffer 
				&srctReadRect); // dest. screen buffer rectangle 

			delete[] chiBuffer; 
		}

		::CloseHandle(hOutBuf); 
		m_vcText.clear(); 
	}

	void SetColor(HANDLE hStdout, WORD wAttributes)
	{
		::SetConsoleTextAttribute(hStdout, wAttributes); 
	}

private:
	std::vector<ConsoleLine>   m_vcText; 
};

static BOOL IsInSharedData(easyipc::IEasyIpcSharedData* pSharedData, DWORD nPID, const CString& strIntName)
{
	for (int i = 0; i < pSharedData->GetCount(); i++)
	{
		easyipc::IEasyIpcSharedDataItem* pItem = pSharedData->GetItem(i); 
		if (pItem->GetPid() == nPID && pItem->GetInterfaceName() == strIntName)
			return TRUE; 
	}

	return FALSE; 
}

static BOOL IsInSharedData(easyipc::IEasyIpcSharedEvent* pSharedEvent, DWORD nPID, const CString& strPipeName)
{
	for (int i = 0; i < pSharedEvent->GetCount(); i++)
	{
		easyipc::IEasyIpcSharedEventItem* pItem = pSharedEvent->GetItem(i); 
		if (pItem->GetPid() == nPID && pItem->GetPipeName() == strPipeName)
			return TRUE; 
	}

	return FALSE; 
}

int _tmain(int argc, _TCHAR* argv[])
{
	::setlocale(0, ""); 
	CStringA str; 
	KConsoleWriter writer; 

	CONSOLE_CURSOR_INFO cursor_info = {0}; 
	cursor_info.bVisible = FALSE;//不显示光标 
	cursor_info.dwSize = 20; 
	HANDLE hStdout = ::GetStdHandle(STD_OUTPUT_HANDLE); 
	::SetConsoleCursorInfo(hStdout, &cursor_info);

	COORD coord = {100, 300}; 
	::SetConsoleScreenBufferSize(hStdout, coord); 

	HWND hWnd = ::GetConsoleWindow(); 
	::SetWindowPos(hWnd, NULL, 0, 0, 900, 800, SWP_NOMOVE); 

	int iCount = 0; 

	while (true)
	{
		// EasyIpc调试接口
		easyipc::IEasyIpcDebug* pIpcDebug = GetEasyIpcDebug(); 
		easyipc::IEasyIpcSharedData* pSharedData = NULL; 
		easyipc::IEasyIpcSharedEvent* pSharedEvent = NULL; 
		easyipc::IIpcServersInfo* pIpcServers = NULL; 

		if (!pIpcDebug)
		{
			writer.AddErrorLine("取EasyIpc调试接口失败！"); 
			goto Tag0; 
		}

		pIpcDebug->GetSharedData(&pSharedData); 
		if (!pSharedData)
		{
			writer.AddErrorLine("获取共享内存信息失败！"); 
			goto Tag0; 
		}

		str.Format("Interface List:"); 
		writer.AddLine(str); 
		writer.AddLine("interfacename        pipename                            pid  process"); 
		for (int i = 0; i < pSharedData->GetCount(); i++)
		{
			easyipc::IEasyIpcSharedDataItem* pItem = pSharedData->GetItem(i); 
			CString strName = pItem->GetInterfaceName(); 
			CString strPipe = pItem->GetPipeName(); 
			int     nPid    = pItem->GetPid(); 

			str.Format("%-20ws %-35ws %4d %ws", strName, strPipe, nPid, GetProcessName(nPid)); 
			writer.AddLine(str); 
		}

		pIpcDebug->GetSharedEvent(&pSharedEvent); 
		if (!pSharedEvent)
		{
			writer.AddErrorLine("获取共享内存事件信息失败！"); 
			goto Tag0; 
		}

		writer.AddLine("\n---------------------------------------------------------------------\n"); 
		str.Format("Regard Event List:"); 
		writer.AddString(str); 

		int iHour = iCount / 3600; 
		int iMinute = (iCount % 3600) / 60; 
		int iSecond = iCount % 60; 
		str.Format("          Launched Time: %02d:%02d:%02d", iHour, iMinute, iSecond); 
		writer.AddLine(str, FOREGROUND_INTENSITY | FOREGROUND_GREEN | FOREGROUND_BLUE); 

		writer.AddLine("pipename                                                 pid  process"); 
		for (int i = 0; i < pSharedEvent->GetCount(); i++)
		{
			easyipc::IEasyIpcSharedEventItem* pItem = pSharedEvent->GetItem(i); 
			CString strPipe = pItem->GetPipeName(); 
			int     nPid    = pItem->GetPid(); 

			str.Format("%-56ws %4d %ws", strPipe, nPid, GetProcessName(nPid)); 
			writer.AddLine(str); 
		}

		pIpcDebug->GetIpcServersInfo(&pIpcServers); 
		if (!pIpcServers)
			goto Tag0; 

		writer.AddLine("\n---------------------------------------------------------------------\n"); 

		int nCount = pIpcServers->GetCount(); 
		for (int i = 0; i < nCount; i++)
		{
			easyipc::IIpcServerInfo* pInfo = pIpcServers->GetItem(i); 
			if (!pInfo)
				continue; 

			DWORD nPID = pInfo->GetPID(); 
			CString strPipeName = pInfo->GetPipeName(); 
			str.Format("%ws", GetProcessName(nPID)); 
			writer.AddString(str, FOREGROUND_INTENSITY | FOREGROUND_RED); 

			writer.AddString(" ["); 
			str.Format("pid:%d", nPID); 
			writer.AddString(str, FOREGROUND_GREEN | FOREGROUND_RED); 
			str.Format(" pipe:%ws", strPipeName); 
			writer.AddString(str, FOREGROUND_BLUE | FOREGROUND_RED); 
			writer.AddLine("]"); 

			str.Format("  [interface]"); 
			writer.AddLine(str, FOREGROUND_INTENSITY | FOREGROUND_GREEN | FOREGROUND_RED); 

			DWORD nIntCount = pInfo->GetInterfaceCount(); 
			for (DWORD j = 0; j < nIntCount; j++)
			{
				CString strIntName = pInfo->GetInterfaceName(j); 
				BOOL bEnable = pInfo->GetEnableState(j); 
				str.Format("    └ %ws", strIntName, bEnable ? L"enabled" : L"disabled"); 
				writer.AddString(str); 
				if (bEnable)
					writer.AddString(" (enabled)", FOREGROUND_INTENSITY | FOREGROUND_GREEN); 
				else
					writer.AddString(" (disabled)", FOREGROUND_INTENSITY | FOREGROUND_RED); 

				if (!IsInSharedData(pSharedData, nPID, strIntName))
					writer.AddErrorLine(" [外部不可见]"); 
				else
					writer.AddLine(""); 

				DWORD nFuncCount = pInfo->GetFunctionCount(j); 
				for (DWORD k = 0; k < nFuncCount; k++)
				{
					CString strFuncName = pInfo->GetFunctionName(j, k); 
					str.Format("       └ %ws", strFuncName); 
					writer.AddLine(str); 
				}
			}

			str.Format("  [regard event]"); 
			if (IsInSharedData(pSharedEvent, nPID, strPipeName))
			{
				writer.AddLine(str, FOREGROUND_INTENSITY | FOREGROUND_GREEN | FOREGROUND_RED); 
			}
			else
			{
				writer.AddString(str, FOREGROUND_INTENSITY | FOREGROUND_GREEN | FOREGROUND_RED); 
				writer.AddErrorLine(" [外部不可见]"); 
			}

			DWORD nEventCount = pInfo->GetRegardEventCount(); 
			for (DWORD j = 0; j < nEventCount; j++)
			{
				CString strEventName = pInfo->GetRegardEventName(j); 
				DWORD nObserverCount = pInfo->GetObserverCount(j); 

				str.Format("    └ %ws", strEventName, nObserverCount); 
				writer.AddString(str); 
				str.Format(" (observer count:%d)", nObserverCount); 
				writer.AddString(str, FOREGROUND_BLUE | FOREGROUND_GREEN); 

				if (strEventName == EASYIPC_DEBUG_EVENT_NAME)
					writer.AddLine(" [debug event]", FOREGROUND_RED); 
				else
					writer.AddLine(""); 
			}

			writer.AddLine("---------------------------------------------------------------------\n"); 
		}

Tag0:
		if (pIpcDebug)
			pIpcDebug->Release(); 

		if (pSharedData)
			pSharedData->Release(); 

		if (pSharedEvent)
			pSharedEvent->Release(); 

		if (pIpcServers)
			pIpcServers->Release(); 

		++iCount; 
		writer.Write(); 
		Sleep(1000); 
		//system("pause"); 
	}
	return 0;
}

