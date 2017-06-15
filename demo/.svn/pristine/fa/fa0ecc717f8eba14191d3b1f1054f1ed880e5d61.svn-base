#ifndef __EasyIpcInterface_h__
#define __EasyIpcInterface_h__
#include <ObjBase.h>

interface IBundle; 

namespace easyipc
{

enum emEasyIpcErrorCode
{
	emEIError_Succeed = 0,              // 成功
	emEIError_ChecksumError,            // 数据校验失败
	emEIError_LoadBufferError,          // 数据加载失败
	emEIError_InterfaceNotFound,        // 接口未找到
	emEIError_InterfaceDisabled,        // 接口被禁用（没有调用Start）
	emEIError_MethodNotFound,           // 方法未找到
	emEIError_FuncReturnError,          // 调用方法时返回错误
	emEIError_InputDataError,           // 从管道接收的数据无效
	emEIError_StartServerError,         // 开始服务失败
	emEIError_UnknownError = -1,        // 未知错误
};

[
	uuid("F1A0A6D1-C271-4770-83E4-214DAB2910DB")
]
interface IEasyIpcBundle
{
	virtual void __stdcall Release(void) = 0;
	virtual bool __stdcall PushInt(LPCWSTR pszName, int nValue) = 0;
	virtual bool __stdcall PushString(LPCWSTR pszName, LPCWSTR szString) = 0;
	virtual bool __stdcall PushBinary(LPCWSTR pszName, LPCVOID pBuffer, int nSize) = 0;

	virtual bool __stdcall HasValue(LPCWSTR pszName) = 0; 
	virtual int __stdcall GetInt(LPCWSTR pszName, int nDefault) = 0;
	virtual LPCWSTR __stdcall GetString(LPCWSTR pszName, LPCWSTR pszDefault) = 0;
	virtual int __stdcall GetBinary(LPCWSTR pszName, LPVOID pBuffer, int nSize) = 0;

	virtual int __stdcall SetDataBuffer(LPCVOID pBuffer, int nSize) = 0;
	virtual int __stdcall GetDataBuffer(LPVOID pBuffer, int nSize) = 0;
	virtual void __stdcall Clear(void) = 0;

	virtual void __stdcall CopyTo(IEasyIpcBundle* pBundle) = 0; 
	virtual bool __stdcall DeleteValue(LPCWSTR pszName) = 0; 

	virtual IBundle* __stdcall ConvertToIBundle(void) = 0; 
};

interface IEasyEventObject
{
	virtual void __stdcall Release(void) = 0;
	virtual void __stdcall Run(LPCWSTR pszEventName, IEasyIpcBundle* pParam, IEasyIpcBundle* pResult) = 0; 
	virtual BOOL __stdcall Equal(IEasyEventObject* pEventObject) const = 0; 
};

interface IEasyEventCallback
{
	virtual void __stdcall Release(void) = 0;
	virtual BOOL __stdcall Run(LPCWSTR pszEventName, IEasyIpcBundle* pResult) = 0; 
};

[
	uuid("A16E5729-1E18-4b7b-A090-A033F4B7CF3D")
]
interface IEasyIpcClient
{
	virtual void __stdcall Release(void) = 0;
	virtual int  __stdcall Connect(LPCWSTR szInterface) = 0;
	virtual int  __stdcall Disconnect(void) = 0;
	virtual int  __stdcall CallServer(LPCWSTR pszFunction, IEasyIpcBundle* pParam, IEasyIpcBundle* pResult) = 0;
	virtual int  __stdcall TriggerEvent(LPCWSTR pszEventName, IEasyIpcBundle* pParam, IEasyEventCallback* pCallback, BOOL bAsyn) = 0; 
	virtual BOOL __stdcall IsServerActive(void) = 0; 
	virtual BOOL __stdcall WaitEventPusherEnd(DWORD dwMilliseconds) = 0; 
};

interface IEasyIpcExecObject
{
	virtual void __stdcall Release(void) = 0;
	virtual int __stdcall Run(IEasyIpcBundle* pParam, IEasyIpcBundle* pResult) = 0;
};

[
	uuid("0BCAB04C-E848-4d9f-955A-D11FFE7ECF12")
]
interface IEasyIpcServer
{
	virtual void __stdcall Release(void) = 0;
	virtual int __stdcall Register(LPCWSTR pszInterface, LPCWSTR pszFunction, IEasyIpcExecObject* pObject) = 0;
	virtual int __stdcall Unregister(LPCWSTR pszInterface) = 0;
	virtual int __stdcall Start(LPCWSTR pszInterface) = 0;
	virtual int __stdcall Stop(LPCWSTR pszInterface) = 0;
	virtual int __stdcall RegardEvent(LPCWSTR pszEventName, IEasyEventObject* pObject) = 0;
	virtual int __stdcall UnregardEvent(LPCWSTR pszEventName, IEasyEventObject* pObject) = 0;
};

interface IEasyIpcSharedDataItem
{
	virtual LPCWSTR __stdcall GetInterfaceName(void) = 0; 
	virtual LPCWSTR __stdcall GetPipeName(void) = 0; 
	virtual DWORD   __stdcall GetPid(void) = 0; 
};

interface IEasyIpcSharedData
{
	virtual void __stdcall Release(void) = 0; 
	virtual int  __stdcall GetCount(void) = 0; 
	virtual IEasyIpcSharedDataItem* __stdcall GetItem(int nIndex) = 0; 
};

interface IEasyIpcSharedEventItem
{
	virtual LPCWSTR __stdcall GetPipeName(void) = 0; 
	virtual DWORD   __stdcall GetPid(void) = 0; 
};

interface IEasyIpcSharedEvent
{
	virtual void __stdcall Release(void) = 0; 
	virtual int  __stdcall GetCount(void) = 0; 
	virtual IEasyIpcSharedEventItem* __stdcall GetItem(int nIndex) = 0; 
};

interface IIpcServerInfo
{
	virtual DWORD   __stdcall GetPID() = 0; 
	virtual LPCWSTR __stdcall GetPipeName() = 0; 
	virtual DWORD   __stdcall GetInterfaceCount() = 0; 
	virtual LPCWSTR __stdcall GetInterfaceName(DWORD nIndex) = 0; 
	virtual BOOL    __stdcall GetEnableState(DWORD nIndex) = 0; 
	virtual DWORD   __stdcall GetFunctionCount(DWORD nIndex) = 0; 
	virtual LPCWSTR __stdcall GetFunctionName(DWORD nIndex, DWORD nSubIndex) = 0; 
	virtual DWORD   __stdcall GetRegardEventCount() = 0; 
	virtual LPCWSTR __stdcall GetRegardEventName(DWORD nIndex) = 0; 
	virtual DWORD   __stdcall GetObserverCount(DWORD nIndex) = 0; 
};

interface IIpcServersInfo
{
	virtual void __stdcall Release(void) = 0; 
	virtual int  __stdcall GetCount(void) = 0; 
	virtual IIpcServerInfo* __stdcall GetItem(int nIndex) = 0; 
};

[
	uuid("D13FFA6A-4D52-4622-814F-10FC6A0782D9")
]
interface IEasyIpcDebug
{
	virtual void    __stdcall Release(void) = 0; 
	virtual int     __stdcall GetSharedData(IEasyIpcSharedData** pSharedData) = 0; 
	virtual int     __stdcall GetSharedEvent(IEasyIpcSharedEvent** pSharedEvent) = 0; 
	virtual int     __stdcall GetIpcServersInfo(IIpcServersInfo** pIpcServers) = 0; 
	virtual LPCWSTR __stdcall GetLastError(void) = 0; 
};


}


#endif