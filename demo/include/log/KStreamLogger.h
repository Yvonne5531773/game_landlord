//////////////////////////////////////////////////////////////////////
//
//  @ File		:	KStreamLogger.h
//  @ Version	:	1.0
//  @ Author	:	EasyLogic
//  @ Datetime	:	[2010-12-25, 12:55:06]
//  @ Brief		:	�������� LOGGER ʵ��
//  @ Remark	:	��д KSL ��Ϊ 'Kingsoft Stream Logger'
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
	enum_KSL_PATH_OPTION__EXE,				// ��־�ļ��������� exe ����Ŀ¼
	enum_KSL_PATH_OPTION__LoadModule,		// ��־�ļ��������ڼ���ģ������Ŀ¼
	enum_KSL_PATH_OPTION__SpecifyFullPath,	// ָ��ȫ·��
} EM_KSL_PATH_OPTION;


typedef enum _EM_KSL_FORMAT_CODE
{
	enumLogEnd		// һ����־�Ľ�����־��������ÿ����־��������˱�־��
} EM_KSL_FORMAT_CODE;


//-------------------------------------------------------------------------


/*
* @brief	�������Ĵ���־�ඨ��
*
* @param	Toption ѡ���ʶ��־�ļ�·���Ļ�ȡ��ʽ
* @param	Tname �� Toption Ϊ enum_KSL_PATH_OPTION__EXE
*	���� enum_KSL_PATH_OPTION__LoadModule ʱ��ʾ��־�ļ�����
*	�� Toption Ϊ enum_KSL_PATH_OPTION__SpecifyFullPath ʱ��ʾ��־�ļ���ȫ·����
*	ȡ NULL ֵʱ����ʹ�ü���ģ�������ƴ���� 
*
* @remark_1	������ģ�����ʱ��ʹ��Ĭ��ֵ����ʱ��־�ļ����Լ���ģ�������ƴ����
*	'.log' ��׺���� 'ksscore.dll.log'����Ϊ�ļ�����������־�ļ������� EXE ����
*	·��
* @remark_2 ��ģ����ĵڶ���ģ�����Ϊ�����ַ������ͣ��뱣֤��Ϊ�ⲿ���Ӷ���
*	extern����������ֱ�Ӵ��� L"xxx" ��ʽ���ַ�������ֵ��
* @remark_3	����1������ sample.dll ��ʹ�ñ�ʵ�֣�����ϣ�����ɵ� log ��Ϊ
*	sample.log ������ dll λ��ͬһĿ¼����ɰ����·�ʽ����� logger:
*	1>. ͷ�ļ��У�
*		extern const wchar_t g_wszSampleDllLogVarName[];	// ������ .cpp ��
*		#define LOGGER KStreamLogger<enum_KSL_PATH_OPTION__LoadModule, g_wszSampleDllLogVarName>::Instance()
*	2>. Դ�ļ��У�
*		extern const wchar_t g_wszSampleDllLogVarName[] = L"sample.log";
* @remark_4	����2������ sample.dll ��ʹ�ñ�ʵ�֣�����ϣ�����ɵ� log
*	�� dll ͬ����sample.dll.log����λ�� exe ����Ŀ¼�������ͷ�ļ��а����·�ʽ
*	����� logger:
*		#define LOGGER KStreamLogger<>::Instance()
*	��ΪĬ��ģ���������ʾ�� exe ����Ŀ¼������ dll ͬ�������� .log ��׺������־�ļ�
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
	/* ��ȡ����ģ���ļ��� */
	std::wstring GetLoadModuleFileName() const;
	bool OpenLogFile();


private:
	static CRITICAL_SECTION*	m_pMutex;
	BOOL						m_bPreLogged;	// ��־��ǰһ����־�Ƿ�����ʱ��
	FILE*						m_pFile;
	std::wstring				m_strLogFilePath;
};


//-------------------------------------------------------------------------


#include "KStreamLogger.inl"
