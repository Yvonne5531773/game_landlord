//////////////////////////////////////////////////////////////////////
//
//  @ File		:	KStreamLogger.h
//  @ Version	:	1.0
//  @ Author	:	EasyLogic
//  @ Datetime	:	[2010-12-25, 12:55:06]
//  @ Brief		:	基于流的 LOGGER 实现
//  @ Remark	:	缩写 KSL 意为 'Kingsoft Stream Logger'
//
//////////////////////////////////////////////////////////////////////
#pragma once
#include <windows.h>
#include <sstream>
#include <fstream>
#include <iomanip>
#include <shlwapi.h>


//-------------------------------------------------------------------------


typedef enum _EM_KSL_PATH_OPTION
{
	enum_KSL_PATH_OPTION__EXE,				// 日志文件将保存在 exe 所在目录
	enum_KSL_PATH_OPTION__LoadModule,		// 日志文件将保存在加载模块所在目录
	enum_KSL_PATH_OPTION__SpecifyFullPath,	// 指定全路径
} EM_KSL_PATH_OPTION;


typedef enum _EM_KSL_FORMAT_CODE
{
	enumLogEnd		// 一条日志的结束标志（必须在每条日志的最后插入此标志）
} EM_KSL_FORMAT_CODE;


//-------------------------------------------------------------------------


/*
* @brief	基于流的打日志类定义
*
* @param	Toption 选项，标识日志文件路径的获取方式
* @param	Tname 当 Toption 为 enum_KSL_PATH_OPTION__EXE
*	或者 enum_KSL_PATH_OPTION__LoadModule 时表示日志文件名；
*	当 Toption 为 enum_KSL_PATH_OPTION__SpecifyFullPath 时表示日志文件的全路径；
*	取 NULL 值时，则使用加载模块的名称拼接上 
*
* @remark_1	当不传模板参数时，使用默认值，此时日志文件会以加载模块的名称拼接上
*	'.log' 后缀（如 'ksscore.dll.log'）作为文件名，并将日志文件保存在 EXE 所在
*	路径
* @remark_2 此模板类的第二个模板参数为常量字符串类型，须保证其为外部链接对象（
*	extern），而不能直接传递 L"xxx" 形式的字符串字面值。
* @remark_3	【例1】想在 sample.dll 中使用本实现，并且希望生成的 log 名为
*	sample.log 并且与 dll 位于同一目录，则可按如下方式定义此 logger:
*	1>. 头文件中：
*		extern const wchar_t g_wszSampleDllLogVarName[];	// 定义在 .cpp 中
*		#define LOGGER KStreamLogger<enum_KSL_PATH_OPTION__LoadModule, g_wszSampleDllLogVarName>::Instance()
*	2>. 源文件中：
*		extern const wchar_t g_wszSampleDllLogVarName[] = L"sample.log";
* @remark_4	【例2】想在 sample.dll 中使用本实现，并且希望生成的 log
*	与 dll 同名（sample.dll.log）且位于 exe 所在目录，则可在头文件中按如下方式
*	定义此 logger:
*		#define LOGGER KStreamLogger<>::Instance()
*	因为默认模板参数即表示在 exe 所在目录生成与 dll 同名（但加 .log 后缀）的日志文件
*/
template
<
	EM_KSL_PATH_OPTION Toption = enum_KSL_PATH_OPTION__EXE,
	const wchar_t* Tname = NULL
>
class KStreamLogger
{
public:
	~KStreamLogger();
	static KStreamLogger<Toption, Tname>& Instance();


public:
	KStreamLogger<Toption, Tname>& operator<<(const EM_KSL_FORMAT_CODE& formatCode);
	KStreamLogger<Toption, Tname>& operator<<(const bool& bVal);
	KStreamLogger<Toption, Tname>& operator<<(const int& nVal);
	KStreamLogger<Toption, Tname>& operator<<(const unsigned int& uVal);
	KStreamLogger<Toption, Tname>& operator<<(const long& lVal);
	KStreamLogger<Toption, Tname>& operator<<(const unsigned long& ulVal);
	KStreamLogger<Toption, Tname>& operator<<(const unsigned long long& ullVal);
	KStreamLogger<Toption, Tname>& operator<<(const float& fVal);
	KStreamLogger<Toption, Tname>& operator<<(const double& dbVal);
	KStreamLogger<Toption, Tname>& operator<<(const wchar_t& wcVal);
	KStreamLogger<Toption, Tname>& operator<<(const wchar_t* pwszVal);
	KStreamLogger<Toption, Tname>& operator<<(const std::wstring& strVal);
	KStreamLogger<Toption, Tname>& operator<<(const GUID& guid);


protected:
	KStreamLogger();
	void Init();
	void Uninit();
	static void Lock();
	static void Unlock();
	static CRITICAL_SECTION* InitCS();
	void PreLogging();


private:
	bool GetLogFilePath();
	/* 获取加载模块文件名 */
	std::wstring GetLoadModuleFileName() const;
	bool OpenLogFile();


private:
	static CRITICAL_SECTION*	m_pMutex;
	BOOL						m_bPreLogged;	// 标志当前一条日志是否打过了时间
	FILE*						m_pFile;
	std::wstring				m_strLogFilePath;
};


//-------------------------------------------------------------------------


#include "KStreamLogger.inl"
