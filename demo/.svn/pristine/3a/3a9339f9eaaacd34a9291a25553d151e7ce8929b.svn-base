#ifndef __EASYIPCPHONEQUERY_H__
#define __EASYIPCPHONEQUERY_H__

#include "EasyIpcClientWrap.h"


class KIpcPhoneQuery
{
public:

	KIpcPhoneQuery() : m_ipcClient(L"KMobileConnIpcServer")
	{
	}

	~KIpcPhoneQuery()
	{
	}

	/*
	* @brief 获取mobileduba是否安全的问题
	*
	* @param[in]  bInstall   返回当前手机手机毒霸是否安装。
	*
	* @return 0 成功,其他为失败错误码
	*/
	int __stdcall QueryDubaInstState(BOOL& bInstall)
	{
		int nReturn = -1;
		int nInstaState = 0;

		if (m_ipcClient.Call(L"QueryDubaInstState") != 0)
			goto Exit0;


		bInstall = FALSE;

		nInstaState = m_ipcClient.GetInt(L"dubainst");
		if (nInstaState == -1)
			goto Exit0;

		if (nInstaState == 1)
			bInstall = TRUE;
		else
			bInstall = FALSE;
		
		nReturn = 0;

	Exit0:
		return nReturn;
	}

private:
	KEasyIpcClientWrap m_ipcClient;

};


#endif