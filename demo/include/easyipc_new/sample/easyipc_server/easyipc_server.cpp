// easyipc_server.cpp : Defines the entry point for the console application.
//

#include "stdafx.h"
#include <Windows.h>
#include <atlstr.h>
#include "include\easyipc_new\easyipcserverwrap.h"
#include "include\easyipc_new\easyipceventwrap.h"

interface ICalculate
{
	virtual int Sum(easyipc::IEasyIpcBundle* pParam, easyipc::IEasyIpcBundle* pResult) = 0; 
	virtual int Sub(easyipc::IEasyIpcBundle* pParam, easyipc::IEasyIpcBundle* pResult) = 0; 
	virtual void OnEvent(LPCWSTR pszEventName, easyipc::IEasyIpcBundle* pObject, easyipc::IEasyIpcBundle* pResult) = 0; 
}; 

struct KCalculate : public ICalculate
{
	int Sum(easyipc::IEasyIpcBundle* pParam, easyipc::IEasyIpcBundle* pResult)
	{
		KEasyIpcBundleWrap param(pParam); 
		KEasyIpcBundleWrap result(pResult); 
		int a = param.GetInt(L"a"); 
		int b = param.GetInt(L"b"); 
		result.PushInt(L"result", a + b); 
		return 0; 
	}

	int Sub(easyipc::IEasyIpcBundle* pParam, easyipc::IEasyIpcBundle* pResult)
	{
		KEasyIpcBundleWrap param(pParam); 
		KEasyIpcBundleWrap result(pResult); 
		int a = param.GetInt(L"a"); 
		int b = param.GetInt(L"b"); 
		result.PushInt(L"result", a - b); 
		return 0; 
	}

	// �¼���Ӧ
	void OnEvent(LPCWSTR pszEventName, easyipc::IEasyIpcBundle* pParam, easyipc::IEasyIpcBundle* pResult)
	{
		CString strName = pszEventName; 
		KEasyIpcBundleWrap param(pParam); 

		printf("\nOnEvent : %ws\n", pszEventName); 
		if (strName == L"abc")
		{
			printf("a = %ws, b = %d\n", param.GetString(L"a"), param.GetInt(L"b")); 
		}
		else if (strName == L"123")
		{
			printf("a = %ws\n", param.GetString(L"a")); 
		}

		static int i = 0; 
		pResult->PushInt(L"a", i++); 
		pResult->PushString(L"b", L"abc"); 
	}
}; 

// 1. IPC �ṩ�߶���
KCalculate ipcProvider;

// 2. ע��IPC����
EASYIPC_REGISTER_METHOD(ICalculate, Sum, &ipcProvider)
EASYIPC_REGISTER_METHOD(ICalculate, Sub, &ipcProvider)


int _tmain(int argc, _TCHAR* argv[])
{
	// 3. ��ʼIPC���񣬿�ʼIPC����֮ǰ��Ҫ��ע��IPC����
	//    ֻ�п�ʼIPC����֮��IPC�ͻ��˲��ܵ��ô�IPC
	EASYIPC_START_INTERFACE(ICalculate); 
	puts("ipc server start..."); 

	system("pause"); 

	// 4. �˳�֮ǰֹͣIPC����
	EASYIPC_STOP_INTERFACE(ICalculate); 
	puts("ipc server stoped."); 


	/******* �¼����� *******/
	KCalculate ipcEvent; 

	// ��ע�¼�          �¼���  �¼������ص�          �¼����ն���
	EASYIPC_REGARD_EVENT(L"abc", &KCalculate::OnEvent, &ipcEvent); 
	EASYIPC_REGARD_EVENT(L"123", &KCalculate::OnEvent, &ipcEvent); 

	system("pause"); 

	// ȡ���¼���ע
	EASYIPC_UNREGARD_EVENT(L"abc", &KCalculate::OnEvent, &ipcEvent); 
	EASYIPC_UNREGARD_EVENT(L"123", &KCalculate::OnEvent, &ipcEvent); 

	system("pause"); 
	return 0;
}

