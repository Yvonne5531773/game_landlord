//////////////////////////////////////////////////////////////////////
//
//  @ File		:	KStreamLogger.inl
//  @ Version	:	1.0
//  @ Author	:	LoGiC
//  @ Datetime	:	[2011-7-6, 15:00:02]
//  @ Brief		:	
//
//////////////////////////////////////////////////////////////////////

#if !defined(__KSTREAMLOGGER__INL__LOGIC__2011_7_6_15_00_02__)
#define __KSTREAMLOGGER__INL__LOGIC__2011_7_6_15_00_02__


#include <locale.h>


//-------------------------------------------------------------------------


#define	KSTREAM_LOGGER_MAX_LOGFILE_SIZE	(1024*1024*10)

#define	KSL_LOG_EXT_W					L".log"

#if defined(_MSC_VER) && (_MSC_VER >= 1400)
#define	LOG_FILE_OPEN_MODE__TRUNC_W		L"w, ccs=UTF-8"
#define	LOG_FILE_OPEN_MODE__APPEND_W	L"a, ccs=UTF-8"
#else
#define	LOG_FILE_OPEN_MODE__TRUNC_W		L"w"
#define	LOG_FILE_OPEN_MODE__APPEND_W	L"a"
#endif


extern "C" IMAGE_DOS_HEADER __ImageBase;


//-------------------------------------------------------------------------


template<EM_KSL_PATH_OPTION Toption, const wchar_t* Tname>
CRITICAL_SECTION* KStreamLogger<Toption, Tname>::m_pMutex	= InitCS();


template<EM_KSL_PATH_OPTION Toption, const wchar_t* Tname>
KStreamLogger<Toption, Tname>::KStreamLogger()
{
	m_bPreLogged	= FALSE;
	m_pFile			= NULL;


	this->Init();
}


template<EM_KSL_PATH_OPTION Toption, const wchar_t* Tname>
KStreamLogger<Toption, Tname>::~KStreamLogger()
{
	this->Uninit();

	::DeleteCriticalSection(m_pMutex);

	if (NULL != m_pMutex)
	{
		delete m_pMutex;
		m_pMutex = NULL;
	}
}


template<EM_KSL_PATH_OPTION Toption, const wchar_t* Tname>
KStreamLogger<Toption, Tname>& KStreamLogger<Toption, Tname>::Instance()
{
	// 加锁，在 << enumLogEnd 之后释放此锁
	Lock();

	static KStreamLogger<Toption, Tname> _csl;
	return _csl;
}


template<EM_KSL_PATH_OPTION Toption, const wchar_t* Tname>
CRITICAL_SECTION* KStreamLogger<Toption, Tname>::InitCS()
{
	CRITICAL_SECTION* pMutex = new CRITICAL_SECTION();
	if (NULL == pMutex)
	{
		return NULL;
	}

	::InitializeCriticalSection(pMutex);

	return pMutex;
}


template<EM_KSL_PATH_OPTION Toption, const wchar_t* Tname>
void KStreamLogger<Toption, Tname>::Init()
{
	bool bRet = this->GetLogFilePath();
	if (bRet)
	{
		this->OpenLogFile();
	}
}


template<EM_KSL_PATH_OPTION Toption, const wchar_t* Tname>
bool KStreamLogger<Toption, Tname>::GetLogFilePath()
{
	bool bRet = false;


	switch (Toption)
	{
	case enum_KSL_PATH_OPTION__EXE:
		{
			WCHAR pwszBuf[MAX_PATH] = {0};
			DWORD dwRet = ::GetModuleFileNameW(NULL, pwszBuf, MAX_PATH);
			if (0 == dwRet || MAX_PATH == dwRet)
			{
				return false;
			}

			::PathRemoveFileSpecW(pwszBuf);
			::PathAddBackslashW(pwszBuf);

			m_strLogFilePath = pwszBuf;

			if (NULL != Tname)
			{
				m_strLogFilePath += Tname;
			}
			else
			{
				m_strLogFilePath += this->GetLoadModuleFileName();
				m_strLogFilePath += KSL_LOG_EXT_W;
			}

			bRet = true;
		}

		break;

	case enum_KSL_PATH_OPTION__LoadModule:
		{
			WCHAR pwszBuf[MAX_PATH] = {0};
			DWORD dwRet = ::GetModuleFileNameW(
				reinterpret_cast<HMODULE>(&__ImageBase),
				pwszBuf,
				MAX_PATH
				);
			if (0 == dwRet || MAX_PATH == dwRet)
			{
				return false;
			}

			::PathRemoveFileSpecW(pwszBuf);
			::PathAddBackslashW(pwszBuf);

			m_strLogFilePath = pwszBuf;

			if (NULL != Tname)
			{
				m_strLogFilePath += Tname;
			}
			else
			{
				m_strLogFilePath += this->GetLoadModuleFileName();
				m_strLogFilePath += KSL_LOG_EXT_W;
			}

			bRet = true;
		}

		break;

	case enum_KSL_PATH_OPTION__SpecifyFullPath:
		{
			if (NULL != Tname)
			{
				m_strLogFilePath = Tname;

				bRet = true;
			}
		}
		break;

	default:
		break;
	}


	return bRet;
}


template<EM_KSL_PATH_OPTION Toption, const wchar_t* Tname>
std::wstring KStreamLogger<Toption, Tname>::GetLoadModuleFileName() const
{
	std::wstring strName;
	WCHAR pwszBuf[MAX_PATH] = {0};
	DWORD dwRet = ::GetModuleFileNameW(
		reinterpret_cast<HMODULE>(&__ImageBase),
		pwszBuf,
		MAX_PATH
		);
	if (0 == dwRet || MAX_PATH == dwRet)
	{
		return strName;
	}


	strName = pwszBuf;
	std::wstring::size_type stIndex = strName.rfind(L'\\');
	if (std::wstring::npos != stIndex && stIndex < (strName.length() - 1))
	{
		strName = strName.substr(stIndex + 1);
	}
	else
	{
		strName = L"";
	}


	return strName;
}


template<EM_KSL_PATH_OPTION Toption, const wchar_t* Tname>
bool KStreamLogger<Toption, Tname>::OpenLogFile()
{
	WIN32_FIND_DATA fileData	= { 0 };
	HANDLE	hFile				= ::FindFirstFile( m_strLogFilePath.c_str(), &fileData);
	bool	bOpenTruncMode		= false;


	if (hFile != INVALID_HANDLE_VALUE)
	{
		::FindClose(hFile);
		if ( fileData.nFileSizeLow > KSTREAM_LOGGER_MAX_LOGFILE_SIZE || fileData.nFileSizeHigh)
			bOpenTruncMode = true;
	}


	if (bOpenTruncMode)
	{
		m_pFile = ::_wfopen(
			m_strLogFilePath.c_str(),
			LOG_FILE_OPEN_MODE__TRUNC_W
			);
	}
	else	// add end
	{
		m_pFile = ::_wfopen(
			m_strLogFilePath.c_str(),
			LOG_FILE_OPEN_MODE__APPEND_W
			);
	}


	if (NULL == m_pFile)
	{
		return false;
	}

	
	::fwprintf(m_pFile, L"=====================================================================\n\n");


	return TRUE;
}


template<EM_KSL_PATH_OPTION Toption, const wchar_t* Tname>
void KStreamLogger<Toption, Tname>::Uninit()
{
	if (NULL != m_pFile)
	{
		::fflush(m_pFile);
		::fclose(m_pFile);
	}
}


template<EM_KSL_PATH_OPTION Toption, const wchar_t* Tname>
void KStreamLogger<Toption, Tname>::Lock()
{
	::EnterCriticalSection(m_pMutex);
}


template<EM_KSL_PATH_OPTION Toption, const wchar_t* Tname>
void KStreamLogger<Toption, Tname>::Unlock()
{
	::LeaveCriticalSection(m_pMutex);
}


template<EM_KSL_PATH_OPTION Toption, const wchar_t* Tname>
void KStreamLogger<Toption, Tname>::PreLogging()
{
	if (m_pFile && !m_bPreLogged)
	{
		SYSTEMTIME SystemTime;
		::GetLocalTime(&SystemTime);

		::fwprintf(
			m_pFile,
			L"%04d-%02d-%02d %02d:%02d:%02d|~%04d| ",
			SystemTime.wYear,
			SystemTime.wMonth,
			SystemTime.wDay,
			SystemTime.wHour,
			SystemTime.wMinute,
			SystemTime.wSecond,
			::GetCurrentThreadId()
			);

		m_bPreLogged = TRUE;
	}
}


template<EM_KSL_PATH_OPTION Toption, const wchar_t* Tname>
KStreamLogger<Toption, Tname>& KStreamLogger<Toption, Tname>::operator<<(const EM_KSL_FORMAT_CODE& formatCode)
{
	(formatCode);
	if (NULL != m_pFile)
	{
		::fwprintf(m_pFile, L"\n");
		::fflush(m_pFile);
		m_bPreLogged = FALSE;
	}


	this->Unlock();

	return *this;
}


template<EM_KSL_PATH_OPTION Toption, const wchar_t* Tname>
KStreamLogger<Toption, Tname>& KStreamLogger<Toption, Tname>::operator<<(const bool& bVal)
{
	if (NULL != m_pFile)
	{
		this->PreLogging();

		::fwprintf(m_pFile, L"%1d", bVal);
	}

	return *this;
}


template<EM_KSL_PATH_OPTION Toption, const wchar_t* Tname>
KStreamLogger<Toption, Tname>& KStreamLogger<Toption, Tname>::operator<<(const int& nVal)
{
	if (NULL != m_pFile)
	{
		this->PreLogging();

		::fwprintf(m_pFile, L"%d", nVal);
	}

	return *this;
}


template<EM_KSL_PATH_OPTION Toption, const wchar_t* Tname>
KStreamLogger<Toption, Tname>& KStreamLogger<Toption, Tname>::operator<<(const unsigned int& uVal)
{
	if (NULL != m_pFile)
	{
		this->PreLogging();

		::fwprintf(m_pFile, L"%u", uVal);
	}

	return *this;
}


template<EM_KSL_PATH_OPTION Toption, const wchar_t* Tname>
KStreamLogger<Toption, Tname>& KStreamLogger<Toption, Tname>::operator<<(const long& lVal)
{
	if (NULL != m_pFile)
	{
		this->PreLogging();

		::fwprintf(m_pFile, L"%ld", lVal);
	}

	return *this;
}


template<EM_KSL_PATH_OPTION Toption, const wchar_t* Tname>
KStreamLogger<Toption, Tname>& KStreamLogger<Toption, Tname>::operator<<(const unsigned long& ulVal)
{
	if (NULL != m_pFile)
	{
		this->PreLogging();

		::fwprintf(m_pFile, L"%lu", ulVal);
	}

	return *this;
}

template<EM_KSL_PATH_OPTION Toption, const wchar_t* Tname>
KStreamLogger<Toption, Tname>& KStreamLogger<Toption, Tname>::operator<<(const unsigned long long& ullVal)
{
	if (NULL != m_pFile)
	{
		this->PreLogging();

		::fwprintf(m_pFile, L"%llu", ullVal);
	}

	return *this;
}

template<EM_KSL_PATH_OPTION Toption, const wchar_t* Tname>
KStreamLogger<Toption, Tname>& KStreamLogger<Toption, Tname>::operator<<(const float& fVal)
{
	if (NULL != m_pFile)
	{
		this->PreLogging();

		::fwprintf(m_pFile, L"%f", fVal);
	}

	return *this;
}


template<EM_KSL_PATH_OPTION Toption, const wchar_t* Tname>
KStreamLogger<Toption, Tname>& KStreamLogger<Toption, Tname>::operator<<(const double& dbVal)
{
	if (NULL != m_pFile)
	{
		this->PreLogging();

		::fwprintf(m_pFile, L"%f", dbVal);
	}

	return *this;
}


template<EM_KSL_PATH_OPTION Toption, const wchar_t* Tname>
KStreamLogger<Toption, Tname>& KStreamLogger<Toption, Tname>::operator<<(const wchar_t& wcVal)
{
	if (NULL != m_pFile)
	{
		this->PreLogging();

		::fwprintf(m_pFile, L"%c", wcVal);
	}

	return *this;
}


template<EM_KSL_PATH_OPTION Toption, const wchar_t* Tname>
KStreamLogger<Toption, Tname>& KStreamLogger<Toption, Tname>::operator<<(const wchar_t* pwszVal)
{
	if (NULL != m_pFile)
	{
		this->PreLogging();

		::fwprintf(m_pFile, L"%s", pwszVal);
	}

	return *this;
}


template<EM_KSL_PATH_OPTION Toption, const wchar_t* Tname>
KStreamLogger<Toption, Tname>& KStreamLogger<Toption, Tname>::operator<<(const std::wstring& strVal)
{
	if (NULL != m_pFile)
	{
		this->PreLogging();

		::fwprintf(m_pFile, L"%s", strVal.c_str());
	}

	return *this;
}


template<EM_KSL_PATH_OPTION Toption, const wchar_t* Tname>
KStreamLogger<Toption, Tname>& KStreamLogger<Toption, Tname>::operator<<(const GUID& guid)
{
	if (NULL != m_pFile)
	{
		this->PreLogging();

		wchar_t pwszGuid[MAX_PATH]	= {0};
		StringFromGUID2(guid, (LPOLESTR)pwszGuid, MAX_PATH); 

		::fwprintf(m_pFile, L"%s", pwszGuid);
	}

	return *this;
}


//-------------------------------------------------------------------------


#endif	//	!defined(__KSTREAMLOGGER__INL__LOGIC__2011_7_6_15_00_02__)
//-------------------------------------------------------------------------

