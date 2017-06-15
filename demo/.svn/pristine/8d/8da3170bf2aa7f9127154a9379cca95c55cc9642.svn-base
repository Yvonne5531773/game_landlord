#ifndef __EASYIPCAPKSAFEWRAP_H__
#define __EASYIPCAPKSAFEWRAP_H__

#include "EasyIpcClientWrap.h"
#include "kmobilescan/scanphone_def.h"
#include "atlstr.h"

typedef struct  
{
	CString		strAppName;				//apk名称(显示名）
	CString		strPkgName;				//apk包名
	CString		strVersion;				//apk版本
	CStringA	bIconBuf;				//apk图标内容
}KWRAPAPKINFORESULT;

class KIpcApkSafeQuery {
public:
	/*
	* @brief 判断样本是否是apk文件
	*
	* @param[in]   strPath    文件的路径
	* @param[out]  bApk		  TRUE表示是apk，FALSE为非apk
	*
	* @return 0 成功,其他为失败错误码
	*/
	int IsAndroidApk(const wchar_t* strPath, BOOL& bApk)
	{
		BOOL bRet = m_ipcClient.AddParam(L"strPath", strPath);
		if (!bRet)
			return -1;

		int iRet = m_ipcClient.Call(L"IsAndroidApk");
		if (0 != iRet)
			return -1;

		bApk = m_ipcClient.GetInt(L"bApk");
		return 0;
	}

	/*
	* @brief 获取apk样本的名字，图标等信息
	*
	* @param[in]  strApkPath   apk文件的路径
	* @param[out] stApkInfo    apk名称，图标等信息，@see KWRAPAPKINFORESULT
	*
	* @return 0 成功,其他为失败错误码
	*/
	int __stdcall GetApkInfo(const wchar_t* strPath, KWRAPAPKINFORESULT& stApkInfo)
	{
		BOOL bRet = m_ipcClient.AddParam(L"strPath", strPath);
		if (!bRet)
			return -1;

		int iRet = m_ipcClient.Call(L"GetApkInfo");
		if (0 != iRet)
			return -1;

		stApkInfo.strAppName = m_ipcClient.GetString(L"strAppName");
		stApkInfo.strPkgName = m_ipcClient.GetString(L"strPkgName");
		stApkInfo.strVersion = m_ipcClient.GetString(L"strVersion");
		bRet = m_ipcClient.GetBinary(L"bIconBuf", stApkInfo.bIconBuf);
		if (!bRet)
			return -1;

		return 0;
	}

	/**
	* @brief  查云获得某个apk的安全相关信息（该函数有网络操作，会阻塞）
	*
	* @param[in]	wcsApkPath	apk的全路径
	* @param[out]	stSafeInfo	返回的apk安全信息
	*
	* @return 0 成功,其他为失败错误码
	*/
	int	QueryApkSafeInfo(const wchar_t* wcsApkPath, KAPKSAFEINFO& stSafeInfo)
	{

		BOOL bRet = m_ipcClient.AddParam(L"strPath", wcsApkPath);
		if (!bRet)
			return -1;

		int iRet = m_ipcClient.Call(L"QueryApkSafeInfo");
		if (0 != iRet)
			return -1;

		stSafeInfo.bHaveReplace = m_ipcClient.GetInt(L"bHaveReplace");
		stSafeInfo.bMalAD = m_ipcClient.GetInt(L"bMalAD");
		stSafeInfo.bMalPri = m_ipcClient.GetInt(L"bMalPri");
		stSafeInfo.bPiracy = m_ipcClient.GetInt(L"bPiracy");
		stSafeInfo.bReplaceApk = m_ipcClient.GetInt(L"bReplaceApk");
		stSafeInfo.bRiskAD = m_ipcClient.GetInt(L"bRiskAD");
		stSafeInfo.bVirus = m_ipcClient.GetInt(L"bVirus");
		stSafeInfo.iAdCount = m_ipcClient.GetInt(L"iAdCount");
		stSafeInfo.iMalAct = m_ipcClient.GetInt(L"iMalAct");
		stSafeInfo.iPriAct = m_ipcClient.GetInt(L"iPriAct");

		return 0;
	}

	KIpcApkSafeQuery() : m_ipcClient(L"KApkSafeInfoQueryIpcServer") {};
	~KIpcApkSafeQuery() {};

private:
	KEasyIpcClientWrap m_ipcClient;

};


#endif