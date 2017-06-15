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
	// IPC�ͻ��ˣ�ָ��Ҫ���õĽӿ�
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


	/******* �¼����� *******/
	// 1. �����¼�����
	KEasyIpcEventTrigger eventTrigger; 

	// 2. ����¼�����
	eventTrigger.AddParam(L"a", L"abc"); 
	eventTrigger.AddParam(L"b", 1); 

	// 3. ͬ�������¼�����������ʱ���м��������յ��¼�֪ͨ
	KEventTest evTest; 
	eventTrigger.TriggerEvent(L"abc", &evTest, &KEventTest::Callback); 

	eventTrigger.AddParam(L"a", L"1234"); 
	// 4. �첽�����¼�����������ʱ�����߲�һ���յ�֪ͨ
	eventTrigger.TriggerEvent(L"123", TRUE); 

	// 5. ������첽�����¼�����Ҫ�ڶ����˳�ʱ�ȴ��¼��������
	// ����������߿����޷��յ��¼�֪ͨ
	eventTrigger.WaitEventPusherEnd(); 

	system("pause"); 
	return 0;
}

