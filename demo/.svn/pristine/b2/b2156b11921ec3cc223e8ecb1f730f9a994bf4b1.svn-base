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

	// 事件响应
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

// 1. IPC 提供者对象
KCalculate ipcProvider;

// 2. 注册IPC过程
EASYIPC_REGISTER_METHOD(ICalculate, Sum, &ipcProvider)
EASYIPC_REGISTER_METHOD(ICalculate, Sub, &ipcProvider)


int _tmain(int argc, _TCHAR* argv[])
{
	// 3. 开始IPC服务，开始IPC服务之前需要先注册IPC过程
	//    只有开始IPC服务之后，IPC客户端才能调用此IPC
	EASYIPC_START_INTERFACE(ICalculate); 
	puts("ipc server start..."); 

	system("pause"); 

	// 4. 退出之前停止IPC服务
	EASYIPC_STOP_INTERFACE(ICalculate); 
	puts("ipc server stoped."); 


	/******* 事件监听 *******/
	KCalculate ipcEvent; 

	// 关注事件          事件名  事件触发回调          事件接收对象
	EASYIPC_REGARD_EVENT(L"abc", &KCalculate::OnEvent, &ipcEvent); 
	EASYIPC_REGARD_EVENT(L"123", &KCalculate::OnEvent, &ipcEvent); 

	system("pause"); 

	// 取消事件关注
	EASYIPC_UNREGARD_EVENT(L"abc", &KCalculate::OnEvent, &ipcEvent); 
	EASYIPC_UNREGARD_EVENT(L"123", &KCalculate::OnEvent, &ipcEvent); 

	system("pause"); 
	return 0;
}

