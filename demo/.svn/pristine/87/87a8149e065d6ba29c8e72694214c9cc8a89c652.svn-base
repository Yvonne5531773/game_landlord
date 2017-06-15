/* -------------------------------------------------------------------------
// 文件名      :	KBundle.h
// 创建人      :	dingping
// 创建时间    :	2013/7/1 星期一 17:31:47
// 功能描述    :	
//
// $Id: $
// -----------------------------------------------------------------------*/
#ifndef __KBUNDLE_H__
#define __KBUNDLE_H__

#include <map>
#include <algorithm>
#include <vector>

// -------------------------------------------------------------------------

#define  CURRENT_BUNDLE_VER  1

/***********************************************************************

KBundle 使用示例：

KBundle bundle; 

// 插入数据
bundle.PushInt(L"intValue", 123); 
bundle.PushString(L"strValue", L"string"); 
bundle.PushBinary(L"binValue", "123", sizeof("123")); 

// 测试指定数据是否存在
assert(bundle.HasValue(L"intValue")); 
assert(bundle.HasValue(L"strValue")); 
assert(bundle.HasValue(L"binValue")); 

// 取数据
int intValue     = bundle.GetInt(L"intValue");     // intValue = 123
CString strValue = bundle.GetString(L"strValue");  // strValue = L"string"

DWORD nSize = 0; 
LPCVOID pcvData = bundle.GetBinary(L"binValue", nSize); // pcvData = "123"

************************************************************************/

[
	uuid("24377857-E0FD-4d5e-8245-4236C537D688")
]
interface IBundle
{
	virtual bool           __stdcall PushInt(__in LPCWSTR pszName, __in INT32 nValue) = 0; 
	virtual bool           __stdcall PushInt64(__in LPCWSTR pszName, __in INT64 nValue) = 0; 
	virtual bool           __stdcall PushDouble(__in LPCWSTR pszName, __in double dValue) = 0; 
	virtual bool           __stdcall PushPointer(__in LPCWSTR pszName, __in LPVOID pData) = 0; 
	virtual bool           __stdcall PushString(__in LPCWSTR pszName, __in LPCWSTR pszString) = 0; 
	virtual bool           __stdcall PushBinary(__in LPCWSTR pszName, __in LPCVOID pcvData, DWORD nSize) = 0; 
	virtual bool           __stdcall PushBundle(__in LPCWSTR pszName, __in const IBundle* pBundle) = 0; 
	virtual bool           __stdcall PushList(__in LPCWSTR pszName, __in const IBundle*const* pBundle, __in DWORD nSize) = 0; 
	virtual bool           __stdcall PushListItem(__in LPCWSTR pszName, __in const IBundle* pBundle) = 0; 
	virtual bool           __stdcall RemoveListItem(__in LPCWSTR pszName, __in DWORD nIndex) = 0; 
	virtual bool           __stdcall RemoveListItem(__in LPCWSTR pszName, __in const IBundle* pBundle) = 0; 

	virtual INT32          __stdcall GetInt(__in LPCWSTR pszName, __in_opt INT32 nDefault = 0) const = 0; 
	virtual INT64          __stdcall GetInt64(__in LPCWSTR pszName, __in_opt INT64 nDefault = 0) const = 0; 
	virtual double         __stdcall GetDouble(__in LPCWSTR pszName, __in_opt double dDefault = 0.0) const = 0; 
	virtual LPVOID         __stdcall GetPointer(__in LPCWSTR pszName) const = 0; 
	virtual LPCWSTR        __stdcall GetString(__in LPCWSTR pszName, __in_opt LPCWSTR pszDefault = NULL) const = 0; 
	virtual LPCVOID        __stdcall GetBinary(__in LPCWSTR pszName, __out DWORD& dwSize) const = 0; 
	virtual IBundle*       __stdcall GetBundle(__in LPCWSTR pszName) const = 0; 
	virtual IBundle*const* __stdcall GetList(__in LPCWSTR pszName, __out DWORD& nSize) const = 0; 
	virtual IBundle*       __stdcall GetListItem(__in LPCWSTR pszName, __in DWORD nIndex) const = 0; 

	virtual void           __stdcall Release(void) = 0; 
	virtual bool           __stdcall HasValue(__in LPCWSTR pszName) const = 0; 
	virtual void           __stdcall Clear(void) = 0; 
	virtual void           __stdcall Erase(__in LPCWSTR pszName) = 0; 
	virtual void           __stdcall CopyTo(__out IBundle* pBundle) const = 0; 

	virtual bool           __stdcall SetData(__in LPCVOID pcvData, __in DWORD nSize, __in bool bClear = true) = 0; 
	virtual LPCVOID        __stdcall GetData(__out DWORD& nSize) const = 0; 
};

class KCStringUtil
{
public:
	static CStringA& AppendBin(__out CStringA& str, __in LPCVOID pcvData, __in DWORD nSize)
	{
		int nLength = str.GetLength(); 

		LPSTR pBuf = str.GetBufferSetLength(nLength + nSize) + nLength; 
		::memcpy_s(pBuf, nSize, pcvData, nSize); 

		return str; 
	}

	static CStringA& AppendBin(__out CStringA& str, __in const CStringA& str2)
	{
		return AppendBin(str, str2.GetString(), str2.GetLength()); 
	}

	static CStringA& SetBin(__out CStringA& str, __in LPCVOID pcvData, __in DWORD nSize)
	{
		LPSTR pBuf = str.GetBufferSetLength(nSize); 
		::memcpy_s(pBuf, nSize, pcvData, nSize); 

		return str; 
	}
}; 

class KBundle : public IBundle
{
public:
	enum enumDataType
	{
		enumDataType_None, 
		enumDataType_Int, 
		enumDataType_Int64, 
		enumDataType_Double, 
		enumDataType_Pointer, 
		enumDataType_String, 
		enumDataType_Bin, 
		enumDataType_Bundle, 
		enumDataType_List, 
	};

	class IDATA_ITEM
	{
	public:
		virtual ~IDATA_ITEM(){}
		virtual enumDataType GetType(void) = 0; 
		virtual void         Serialize(CStringA& strData) = 0; 
		virtual bool         Deserialize(LPCVOID pcvBegin, DWORD nSize) = 0; 
	};

	KBundle::KBundle(void)
	{
	}

	KBundle::~KBundle(void)
	{
		Clear(); 
	}

	void __stdcall Release(void)
	{
		delete this; 
	}

	virtual bool __stdcall PushInt(__in LPCWSTR pszName, __in INT32 nValue)
	{
		Erase(pszName); 
		return m_mapData.insert(std::make_pair(pszName, new DATA_ITEM_INT(nValue))).second; 
	}

	virtual bool __stdcall PushInt64(__in LPCWSTR pszName, __in INT64 nValue)
	{
		Erase(pszName); 
		return m_mapData.insert(std::make_pair(pszName, new DATA_ITEM_INT64(nValue))).second; 
	}

	virtual bool __stdcall PushDouble(__in LPCWSTR pszName, __in double dValue)
	{
		Erase(pszName); 
		return m_mapData.insert(std::make_pair(pszName, new DATA_ITEM_DOUBLE(dValue))).second; 
	}

	virtual bool __stdcall PushPointer(__in LPCWSTR pszName, __in LPVOID pData)
	{
		Erase(pszName); 
		return m_mapData.insert(std::make_pair(pszName, new DATA_ITEM_PTR(pData))).second; 
	}

	virtual bool __stdcall PushString(__in LPCWSTR pszName, __in LPCWSTR szString)
	{
		Erase(pszName); 
		return m_mapData.insert(std::make_pair(pszName, new DATA_ITEM_STRING(szString))).second; 
	}

	virtual bool __stdcall PushBinary(__in LPCWSTR pszName, __in LPCVOID pcvData, __in DWORD nSize)
	{
		Erase(pszName); 
		return m_mapData.insert(std::make_pair(pszName, new DATA_ITEM_BINARY(pcvData, nSize))).second; 
	}

	virtual bool __stdcall PushBundle(__in LPCWSTR pszName, __in const IBundle* pBundle)
	{
		if (pBundle == this)
			return false; 

		DATA_ITEM_BUNDLE* pItem = NULL; 
		if (FindItem(pszName, enumDataType_Bundle, (IDATA_ITEM**)&pItem))
		{
			if (pItem->pBundle == pBundle)
				return true; 
		}

		Erase(pszName); 
		return m_mapData.insert(std::make_pair(pszName, new DATA_ITEM_BUNDLE(pBundle))).second; 
	}

	virtual bool __stdcall PushList(__in LPCWSTR pszName, __in const IBundle*const* pBundle, __in DWORD nSize)
	{
		DATA_ITEM_LIST* pItem = NULL; 
		if (FindItem(pszName, enumDataType_List, (IDATA_ITEM**)&pItem))
		{
			pItem->Assign(pBundle, nSize); 
			return true; 
		}

		Erase(pszName); 
		return m_mapData.insert(std::make_pair(pszName, new DATA_ITEM_LIST(pBundle, nSize))).second; 
	}

	virtual bool __stdcall PushListItem(__in LPCWSTR pszName, __in const IBundle* pBundle)
	{
		DATA_ITEM_LIST* pItem = NULL; 
		if (FindItem(pszName, enumDataType_List, (IDATA_ITEM**)&pItem))
		{
			pItem->Append(pBundle); 
			return true; 
		}

		Erase(pszName); 
		return m_mapData.insert(std::make_pair(pszName, new DATA_ITEM_LIST(&pBundle, 1))).second; 
	}

	virtual bool __stdcall RemoveListItem(__in LPCWSTR pszName, __in DWORD nIndex)
	{
		DATA_ITEM_LIST* pItem = NULL; 
		if (FindItem(pszName, enumDataType_List, (IDATA_ITEM**)&pItem))
			return pItem->Erase(nIndex); 

		return false; 
	}

	virtual bool __stdcall RemoveListItem(__in LPCWSTR pszName, __in const IBundle* pBundle)
	{
		DATA_ITEM_LIST* pItem = NULL; 
		if (FindItem(pszName, enumDataType_List, (IDATA_ITEM**)&pItem))
			return pItem->Erase(pBundle); 

		return false; 
	}

	virtual INT32 __stdcall GetInt(__in LPCWSTR pszName, __in_opt INT32 nDefault = 0) const
	{
		INT32 nRet = nDefault; 
		DATA_ITEM_INT* pItem = NULL; 

		if (!FindItem(pszName, enumDataType_Int, (IDATA_ITEM**)&pItem))
			goto Exit0; 

		nRet = pItem->nValue; 
Exit0:
		return nRet; 
	}

	virtual INT64 __stdcall GetInt64(__in LPCWSTR pszName, __in_opt INT64 nDefault = 0) const
	{
		INT64 nRet = nDefault; 
		DATA_ITEM_INT64* pItem = NULL; 

		if (!FindItem(pszName, enumDataType_Int64, (IDATA_ITEM**)&pItem))
			goto Exit0; 

		nRet = pItem->nValue; 
Exit0:
		return nRet; 
	}

	double __stdcall GetDouble(__in LPCWSTR pszName, __in_opt double dDefault = 0.0) const
	{
		double dRet = dDefault; 
		DATA_ITEM_DOUBLE* pItem = NULL; 

		if (!FindItem(pszName, enumDataType_Double, (IDATA_ITEM**)&pItem))
			goto Exit0; 

		dRet = pItem->dValue; 
Exit0:
		return dRet; 
	}

	virtual LPVOID __stdcall GetPointer(__in LPCWSTR pszName) const
	{
		LPVOID pRet = NULL; 
		DATA_ITEM_PTR* pItem = NULL; 

		if (!FindItem(pszName, enumDataType_Pointer, (IDATA_ITEM**)&pItem))
			goto Exit0; 

		pRet = pItem->pData; 
Exit0:
		return pRet; 
	}

	virtual LPCWSTR __stdcall GetString(__in LPCWSTR pszName, __in_opt LPCWSTR pszDefault = NULL) const
	{
		LPCWSTR pszRet = pszDefault; 
		DATA_ITEM_STRING* pItem = NULL; 

		if (!FindItem(pszName, enumDataType_String, (IDATA_ITEM**)&pItem))
			goto Exit0; 

		pszRet = pItem->strValue; 
Exit0:
		return pszRet; 
	}

	virtual LPCVOID __stdcall GetBinary(__in LPCWSTR pszName, __out DWORD& dwSize) const
	{
		LPCVOID pcvRet = NULL; 
		DATA_ITEM_BINARY* pItem = NULL; 

		if (!FindItem(pszName, enumDataType_Bin, (IDATA_ITEM**)&pItem))
			goto Exit0; 

		pcvRet = pItem->strData; 
		dwSize = pItem->strData.GetLength(); 
Exit0:
		return pcvRet; 
	}

	virtual IBundle* __stdcall GetBundle(__in LPCWSTR pszName) const
	{
		IBundle* pBundle = NULL; 
		DATA_ITEM_BUNDLE* pItem = NULL; 

		if (!FindItem(pszName, enumDataType_Bundle, (IDATA_ITEM**)&pItem))
			goto Exit0; 

		pBundle = pItem->pBundle; 
Exit0:
		return pBundle; 
	}

	virtual IBundle*const* __stdcall GetList(__in LPCWSTR pszName, __out DWORD& nSize) const
	{
		IBundle** pBundle = NULL; 
		DATA_ITEM_LIST* pItem = NULL; 

		if (!FindItem(pszName, enumDataType_List, (IDATA_ITEM**)&pItem))
			goto Exit0; 

		nSize = (DWORD)pItem->vcBundle.size(); 
		if (nSize)
			pBundle = (IBundle**)&*pItem->vcBundle.begin(); 
		else
			pBundle = NULL; 
Exit0:
		return pBundle; 
	}

	IBundle* __stdcall GetListItem(__in LPCWSTR pszName, __in DWORD nIndex) const
	{
		DATA_ITEM_LIST* pItem = NULL; 

		if (!FindItem(pszName, enumDataType_List, (IDATA_ITEM**)&pItem))
			return pItem->Get(nIndex); 

		return NULL; 
	}

	virtual void __stdcall Clear(void)
	{
		for (std::map<CString, IDATA_ITEM*>::iterator pos = m_mapData.begin()
			; pos != m_mapData.end()
			; ++pos)
		{
			delete pos->second; 
		}
		m_mapData.clear(); 
	}

	virtual void __stdcall Erase(__in LPCWSTR pszName)
	{
		std::map<CString, IDATA_ITEM*>::iterator pos = m_mapData.find(pszName); 
		if (pos != m_mapData.end())
		{
			delete pos->second; 
			m_mapData.erase(pos); 
		}
	}

	virtual bool __stdcall HasValue(__in LPCWSTR pszName) const
	{
		return m_mapData.find(pszName) != m_mapData.end(); 
	}

	virtual void __stdcall CopyTo(__out IBundle* pBundle) const
	{
		if (!pBundle)
			return; 

		DWORD nSize = 0; 
		LPCVOID pData = GetData(nSize); 
		pBundle->SetData(pData, nSize, false); 
	}

	virtual bool __stdcall SetData(__in LPCVOID pcvData, __in DWORD nSize, __in bool bClear) 
	{
		bool bRet = false; 
		CString strName; 
		IDATA_ITEM* pItem = NULL; 
		const BUNDLE_HEADER& bundleHeader = *(const BUNDLE_HEADER*)pcvData; 

		if (bClear)
			Clear(); 

		if (!VerifyData(pcvData, nSize))
			goto Exit0; 

		LPCSTR pBegin = (LPCSTR)pcvData; 
		LPCSTR pEnd = pBegin + bundleHeader.nTotalSize; 
		for (pBegin += sizeof(BUNDLE_HEADER); pBegin < pEnd; )
		{
			const BUNDLE_ITEM_HEADER& itemHeader = *(const BUNDLE_ITEM_HEADER*)pBegin; 
			pBegin += sizeof(BUNDLE_ITEM_HEADER); 
			if (pBegin + itemHeader.nNameSize*sizeof(WCHAR) + itemHeader.nDataSize > pEnd)
				goto Exit0; 

			strName.SetString((LPCWSTR)pBegin, itemHeader.nNameSize); 
			pBegin += itemHeader.nNameSize*sizeof(WCHAR); 

			switch (itemHeader.nType)
			{
			case enumDataType_Int:
				pItem = new DATA_ITEM_INT; 
				break; 

			case enumDataType_Int64:
				pItem = new DATA_ITEM_INT64; 
				break; 

			case enumDataType_Double:
				pItem = new DATA_ITEM_DOUBLE; 
				break; 

			case enumDataType_Pointer:
				pItem = new DATA_ITEM_PTR; 
				break; 

			case enumDataType_String:
				pItem = new DATA_ITEM_STRING; 
				break; 

			case enumDataType_Bin:
				pItem = new DATA_ITEM_BINARY; 
				break; 

			case enumDataType_Bundle:
				pItem = new DATA_ITEM_BUNDLE; 
				break; 

			case enumDataType_List:
				pItem = new DATA_ITEM_LIST; 
				break; 

			default:
				ATLASSERT(0); 
				goto Exit0; 
			}

			if (!pItem->Deserialize(pBegin, itemHeader.nDataSize))
				goto Exit0; 

			pBegin += itemHeader.nDataSize; 
			if (!m_mapData.insert(std::make_pair(strName, pItem)).second)
				goto Exit0; 

			pItem = NULL; 
		}

		bRet = true; 
Exit0:
		if (pItem)
			delete pItem; 

		return bRet; 
	}

	virtual LPCVOID __stdcall GetData(__out DWORD& nSize) const
	{
		CStringA strData; 
		for (std::map<CString, IDATA_ITEM*>::const_iterator pos = m_mapData.begin()
			; pos != m_mapData.end()
			; ++pos)
		{
			Serialize(pos->first, pos->second, strData); 
		}

		BUNDLE_HEADER bundleHeader; 
		bundleHeader.nVersion   = CURRENT_BUNDLE_VER; 
		bundleHeader.nTotalSize = strData.GetLength() + sizeof(bundleHeader); 
		bundleHeader.nChecksum  = GetChecksum(strData.GetString(), strData.GetLength()); 

		m_strData.Empty(); 
		KCStringUtil::AppendBin(m_strData, &bundleHeader, sizeof(bundleHeader)); 
		KCStringUtil::AppendBin(m_strData, strData); 
		nSize = m_strData.GetLength(); 

		return m_strData.GetString(); 
	}

protected:
	bool FindItem(LPCWSTR pszName, enumDataType enumType, IDATA_ITEM** ppItem) const
	{
		bool bRet = false; 
		std::map<CString, IDATA_ITEM*>::const_iterator pos; 
		pos = m_mapData.find(pszName); 
		if (pos == m_mapData.end())
			goto Exit0; 

		if (pos->second->GetType() != enumType)
			goto Exit0; 

		*ppItem = pos->second; 
		bRet = true; 
Exit0:
		return bRet; 
	}

	void Serialize(const CString& strName, IDATA_ITEM* pItem, CStringA& strData) const
	{
		CStringA strItem; 
		pItem->Serialize(strItem); 

		BUNDLE_ITEM_HEADER itemHeader; 
		itemHeader.nType = pItem->GetType(); 
		itemHeader.nNameSize = strName.GetLength(); 
		itemHeader.nDataSize = strItem.GetLength(); 

		KCStringUtil::AppendBin(strData, &itemHeader, sizeof(itemHeader)); 
		KCStringUtil::AppendBin(strData, strName.GetString(), strName.GetLength()*sizeof(WCHAR)); 
		KCStringUtil::AppendBin(strData, strItem); 
	}

	class DATA_ITEM_INT : public IDATA_ITEM
	{
	public:
		DATA_ITEM_INT(INT32 nValue = 0)
		{
			Assign(nValue); 
		}

		virtual ~DATA_ITEM_INT()
		{

		}

		virtual enumDataType GetType(void)
		{
			return enumDataType_Int; 
		}

		virtual void Serialize(CStringA& strData)
		{
			KCStringUtil::AppendBin(strData, (LPCSTR)&nValue, sizeof(nValue)); 
		}

		virtual bool Deserialize(LPCVOID pcvBegin, DWORD nSize)
		{
			if (nSize != sizeof(INT32))
				return false; 

			nValue = *(PINT32)pcvBegin; 
			return true; 
		}

		void Assign(INT32 nValue)
		{
			this->nValue = nValue; 
		}

		INT32 nValue; 
	};

	struct DATA_ITEM_INT64 : public IDATA_ITEM
	{
	public:
		DATA_ITEM_INT64(INT64 nValue = 0)
		{
			Assign(nValue); 
		}

		virtual ~DATA_ITEM_INT64()
		{

		}

		virtual enumDataType GetType(void)
		{
			return enumDataType_Int64; 
		}

		virtual void Serialize(CStringA& strData)
		{
			KCStringUtil::AppendBin(strData, (LPCSTR)&nValue, sizeof(nValue)); 
		}

		virtual bool Deserialize(LPCVOID pcvBegin, DWORD nSize)
		{
			if (nSize != sizeof(INT64))
				return false; 

			nValue = *(PINT64)pcvBegin; 
			return true; 
		}

		void Assign(INT64 nValue)
		{
			this->nValue = nValue; 
		}

		INT64 nValue; 
	};

	struct DATA_ITEM_DOUBLE : public IDATA_ITEM
	{
	public:
		DATA_ITEM_DOUBLE(double dValue = 0.0)
		{
			Assign(dValue); 
		}

		virtual ~DATA_ITEM_DOUBLE()
		{

		}

		virtual enumDataType GetType(void)
		{
			return enumDataType_Double; 
		}

		virtual void Serialize(CStringA& strData)
		{
			KCStringUtil::AppendBin(strData, (LPCSTR)&dValue, sizeof(dValue)); 
		}

		virtual bool Deserialize(LPCVOID pcvBegin, DWORD nSize)
		{
			if (nSize != sizeof(double))
				return false; 

			dValue = *(double*)pcvBegin; 
			return true; 
		}

		void Assign(double dValue)
		{
			this->dValue = dValue; 
		}

		double dValue; 
	};

	struct DATA_ITEM_PTR : public IDATA_ITEM
	{
	public:
		DATA_ITEM_PTR(LPVOID pData = NULL)
		{
			Assign(pData); 
		}

		virtual ~DATA_ITEM_PTR()
		{

		}

		virtual enumDataType GetType(void)
		{
			return enumDataType_Pointer; 
		}

		virtual void Serialize(CStringA& strData)
		{
			KCStringUtil::AppendBin(strData, (LPCSTR)&pData, sizeof(pData)); 
		}

		virtual bool Deserialize(LPCVOID pcvBegin, DWORD nSize)
		{
			if (nSize != sizeof(LPVOID))
				return false; 

			pData = *(LPVOID*)pcvBegin; 
			return true; 
		}

		void Assign(LPVOID pData)
		{
			this->pData = pData; 
		}

		LPVOID pData; 
	};

	struct DATA_ITEM_STRING : public IDATA_ITEM
	{
	public:
		DATA_ITEM_STRING(LPCWSTR pszValue = NULL)
		{
			Assign(pszValue); 
		}

		virtual ~DATA_ITEM_STRING()
		{

		}

		virtual enumDataType GetType(void)
		{
			return enumDataType_String; 
		}

		virtual void Serialize(CStringA& strData)
		{
			KCStringUtil::AppendBin(strData, strValue.GetString(), strValue.GetLength()*sizeof(WCHAR)); 
		}

		virtual bool Deserialize(LPCVOID pcvBegin, DWORD nSize)
		{
			LPCWSTR pszBegin = (LPCWSTR)pcvBegin; 
			strValue.SetString(pszBegin, nSize / sizeof(WCHAR)); 
			return true; 
		}

		void Assign(LPCWSTR pszValue)
		{
			strValue.SetString(pszValue); 
		}

		CString strValue; 
	};

	struct DATA_ITEM_BINARY : public IDATA_ITEM
	{
	public:
		DATA_ITEM_BINARY(LPCVOID pcvData = NULL, DWORD nSize = 0)
		{
			Assign(pcvData, nSize); 
		}

		virtual ~DATA_ITEM_BINARY()
		{

		}

		virtual enumDataType GetType(void)
		{
			return enumDataType_Bin; 
		}

		virtual void Serialize(CStringA& strData)
		{
			KCStringUtil::AppendBin(strData, this->strData); 
		}

		virtual bool Deserialize(LPCVOID pcvBegin, DWORD nSize)
		{
			KCStringUtil::SetBin(strData, pcvBegin, nSize); 
			return true; 
		}

		void Assign(LPCVOID pcvData, DWORD nSize)
		{
			Deserialize(pcvData, nSize); 
		}

		CStringA strData; 
	};

	struct DATA_ITEM_BUNDLE : public IDATA_ITEM
	{
	public:
		DATA_ITEM_BUNDLE(const IBundle* pBundle = NULL) : pBundle(NULL)
		{
			Assign(pBundle); 
		}

		virtual ~DATA_ITEM_BUNDLE()
		{
			if (pBundle)
				delete pBundle; 
		}

		virtual enumDataType GetType(void)
		{
			return enumDataType_Bundle; 
		}

		virtual void Serialize(CStringA& strData)
		{
			if (!pBundle)
				return; 

			DWORD nSize  = 0; 
			LPCSTR pData = (LPCSTR)pBundle->GetData(nSize); 
			KCStringUtil::AppendBin(strData, pData, nSize); 
		}

		virtual bool Deserialize(LPCVOID pcvBegin, DWORD nSize)
		{
			if (!pBundle)
				pBundle = new KBundle; 

			return pBundle->SetData(pcvBegin, nSize); 
		}

		void Assign(const IBundle* pBundle2)
		{
			if (!pBundle2)
				return; 

			if (!pBundle)
				pBundle = new KBundle; 

			pBundle2->CopyTo(pBundle); 
		}

		IBundle* pBundle; 
	};

	struct DATA_ITEM_LIST : public IDATA_ITEM
	{
	public:
		DATA_ITEM_LIST(const IBundle*const* bundle = NULL, DWORD nSize = 0)
		{
			Assign(bundle, nSize); 
		}

		virtual ~DATA_ITEM_LIST()
		{
			Clear(); 
		}

		virtual enumDataType GetType(void)
		{
			return enumDataType_List; 
		}

		virtual void Serialize(CStringA& strData)
		{
			for (size_t i = 0; i < vcBundle.size(); i++)
			{
				IBundle* pBundle = vcBundle[i]; 
				DWORD nSize = 0; 
				LPCSTR pData = (LPCSTR)pBundle->GetData(nSize); 
				KCStringUtil::AppendBin(strData, pData, nSize); 
			}
		}

		virtual bool Deserialize(LPCVOID pcvBegin, DWORD nSize)
		{
			LPCSTR pszBegin = (LPCSTR)pcvBegin; 
			const BUNDLE_HEADER* bundleHeader = (const BUNDLE_HEADER*)pcvBegin; 
			while (nSize > 0)
			{
				IBundle* pBundle = new KBundle; 
				if (!pBundle->SetData(pszBegin, nSize))
				{
					delete pBundle; 
					Clear(); 
					return false; 
				}

				pszBegin += bundleHeader->nTotalSize; 
				nSize    -= bundleHeader->nTotalSize; 
				bundleHeader = (const BUNDLE_HEADER*)pszBegin; 
				vcBundle.push_back(pBundle); 
			}

			return true; 
		}

		void Clear(void)
		{
			for (size_t i = 0; i < vcBundle.size(); i++)
			{
				delete vcBundle[i]; 
			}

			vcBundle.clear(); 
		}

		void Assign(const IBundle*const* bundle, DWORD nSize)
		{
			std::vector<IBundle*> vcBundleTmp; 
			std::vector<IBundle*>::iterator pos; 

			for (DWORD i = 0; i < nSize; i++)
			{
				pos = std::find(vcBundle.begin(), vcBundle.end(), bundle[i]); 
				if (pos != vcBundle.end())
				{
					vcBundleTmp.push_back(*pos); 
					vcBundle.erase(pos); 
				}
				else
				{
					IBundle* pBundle = new KBundle; 
					bundle[i]->CopyTo(pBundle); 
					vcBundleTmp.push_back(pBundle); 
				}
			}

			Clear(); 
			vcBundle.swap(vcBundleTmp); 
		}

		void Append(const IBundle* pBundle)
		{
			IBundle* pBundle2 = new KBundle; 
			pBundle->CopyTo(pBundle2); 
			vcBundle.push_back(pBundle2); 
		}

		bool Erase(const IBundle* pBundle)
		{
			std::vector<IBundle*>::iterator pos; 
			pos = std::find(vcBundle.begin(), vcBundle.end(), pBundle); 
			if (pos != vcBundle.end())
			{
				delete *pos; 
				vcBundle.erase(pos); 
				return true; 
			}

			return false; 
		}

		bool Erase(DWORD nIndex)
		{
			if (nIndex < vcBundle.size())
			{
				std::vector<IBundle*>::iterator pos; 
				pos = vcBundle.begin() + nIndex; 
				delete *pos; 
				vcBundle.erase(pos); 
				return true; 
			}

			return false; 
		}

		IBundle* Get(DWORD nIndex)
		{
			if (nIndex < vcBundle.size())
				return vcBundle[nIndex]; 

			return NULL; 
		}

		std::vector<IBundle*> vcBundle; 
	};

#pragma pack (1)
	struct BUNDLE_HEADER 
	{
		USHORT nVersion; 
		USHORT nChecksum; 
		DWORD  nTotalSize; 
	};

	struct BUNDLE_ITEM_HEADER
	{
		USHORT  nType; 
		USHORT  nNameSize; 
		DWORD   nDataSize; 
	};
#pragma pack()

	USHORT GetChecksum(LPCVOID pBuf, DWORD nLen) const
	{
		if (!pBuf)
			return 0; 

		USHORT nChecksum = 0; 
		for (DWORD i = 0; i < nLen; i++)
		{
			nChecksum += ((LPCSTR)pBuf)[i]; 
		}
		return nChecksum; 
	}

	bool VerifyData(LPCVOID pcvData, DWORD nSize) const
	{
		bool bRet = false; 
		if (!pcvData || !nSize)
			goto Exit0; 

		if (nSize < sizeof(BUNDLE_HEADER))
			goto Exit0; 

		LPCSTR pBuf = (LPCSTR)pcvData; 
		BUNDLE_HEADER& dataHeader = *(BUNDLE_HEADER*)pBuf; 
		if (dataHeader.nVersion != CURRENT_BUNDLE_VER || dataHeader.nTotalSize > nSize)
			goto Exit0; 

		USHORT nChecksum = (USHORT)GetChecksum(pBuf + sizeof(BUNDLE_HEADER), dataHeader.nTotalSize - sizeof(BUNDLE_HEADER)); 
		if (nChecksum != dataHeader.nChecksum)
			goto Exit0; 

		bRet = true; 
Exit0:
		return bRet; 
	}

private:
	std::map<CString, IDATA_ITEM*>  m_mapData; 
	mutable CStringA                m_strData; 
};


// -------------------------------------------------------------------------
// $Log: $

#endif /* __KBUNDLE_H__ */
