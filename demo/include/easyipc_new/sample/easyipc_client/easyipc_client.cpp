// easyipc_client.cpp : Defines the entry point for the console application.
//

#include "stdafx.h"
#include <Windows.h>
#include <atlstr.h>
#include "include\easyipc_new\easyipcclientwrap.h"
#include "include\easyipc_new\easyipceventwrap.h"

BOOL Sum(KEasyIpcClientWrap& ipcClient, int a, int b, int& nResult)
{
	ipcClient.AddParam(L"a", a); 
	ipcClient.AddParam(L"b", b); 
	int iRet = ipcClient.Call(L"Sum"); 
	if (iRet == 0)
	{
		nResult = ipcClient.GetInt(L"result"); 
		return TRUE; 
	}

	return FALSE; 
}

BOOL Sub(KEasyIpcClientWrap& ipcClient, int a, int b, int& nResult)
{
	ipcClient.AddParam(L"a", a); 
	ipcClient.AddParam(L"b", b); 
	int iRet = ipcClient.Call(L"Sub"); 
	if (iRet == 0)
	{
		nResult = ipcClient.GetInt(L"result"); 
		return TRUE; 
	}

	return FALSE; 
}

class KEventTest
{
public:
	BOOL Callback(LPCWSTR pszEventName, easyipc::IEasyIpcBundle* pResult)
	{
		KEasyIpcBundleWrap result(pResult); 
		puts("--------------------------------"); 
		printf("KEventTest::Callback : %ws\n", pszEventName); 
		printf("a = %d\n", result.GetInt(L"a")); 
		printf("b = %ws\n", result.GetString(L"b")); 

		return TRUE; 
	}
};

int _tmain(int argc, _TCHAR* argv[])
{
	// IPC客户端，指明要调用的接口
	KEasyIpcClientWrap ipcClient(L"ICalculate"); 

	int a = 5, b = 3, nResult = 0; 
	if (Sum(ipcClient, a, b, nResult))
		printf("%d + %d = %d\n", a, b, nResult); 
	else
		puts("call ipc error!"); 

	if (Sub(ipcClient, a, b, nResult))
		printf("%d - %d = %d\n", a, b, nResult); 
	else
		puts("call ipc error!"); 


	/******* 事件触发 *******/
	// 1. 定义事件对象
	KEasyIpcEventTrigger eventTrigger; 

	// 2. 添加事件参数
	eventTrigger.AddParam(L"a", L"abc"); 
	eventTrigger.AddParam(L"b", 1); 

	// 3. 同步触发事件，函数返回时所有监听者已收到事件通知
	KEventTest evTest; 
	eventTrigger.TriggerEvent(L"abc", &evTest, &KEventTest::Callback); 

	eventTrigger.AddParam(L"a", L"1234"); 
	// 4. 异步触发事件，函数返回时监听者不一定收到通知
	eventTrigger.TriggerEvent(L"123", TRUE); 

	// 5. 如果是异步触发事件，需要在对象退出时等待事件推送完成
	// ，否则监听者可能无法收到事件通知
	eventTrigger.WaitEventPusherEnd(); 

	system("pause"); 
	return 0;
}

