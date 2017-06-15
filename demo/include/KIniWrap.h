#ifndef __KIniWrap_h__
#define __KIniWrap_h__

#include <map>
#include <atlstr.h>

#ifndef DEF_EM_INI_ENCODING
#define DEF_EM_INI_ENCODING
///> KIniWrap和KIniWrapEx里都有emIniEncoding
///> 有的情况会同时包含这两个头文件
enum emIniEncoding
{
    emIniEncodingAnsi = 1,
    emIniEncodingUtf8,
    emIniEncodingUnicode,
};
#endif

class KIniWrap
{
public:
	KIniWrap();
	~KIniWrap();

	BOOL LoadFile(LPCTSTR szFileName, int emIniEncode = emIniEncodingUnicode);
	BOOL SaveFile(LPCTSTR szFileName, int emIniEncode);
	BOOL Parse(LPCWSTR szString);
	void Clear(void);

	int Read(LPCWSTR szAppName, LPCWSTR szKeyName, int nDefault);
	BOOL Write(LPCWSTR szAppName, LPCWSTR szKeyName, int nValue);

	LPCWSTR Read(LPCWSTR szAppName, LPCWSTR szKeyName, LPCWSTR szDefault);
	BOOL Write(LPCWSTR szAppName, LPCWSTR szKeyName, LPCWSTR szValue);

	DWORD Read(LPCTSTR szAppName, LPCTSTR szKeyName, LPBYTE pBuffer, DWORD dwSize);
	BOOL Write(LPCTSTR szAppName, LPCTSTR szKeyName, LPBYTE pBuffer, DWORD dwSize);

	const std::map<CStringW, std::map<CStringW, CStringW>>& ReadAll(void);

	BOOL ToString(CStringW& strBuffer);

protected:
	BOOL LoadFileToBuffer(LPCTSTR szFileName, LPVOID* ppBuffer, DWORD& dwSize);
	void ReleaseBuffer(LPVOID pBuffer);
	BOOL GetLine(LPCWSTR szBuffer, CStringW& strLine);
	BOOL ProcessLine(CStringW& strLine);
	BOOL ParseLine(CStringW& strLine, CStringW& strAppName, CStringW& strKeyName, CStringW& strValue);
	BOOL AddItem(CStringW& strAppName, CStringW& strKeyName, LPCWSTR szValue);
	BOOL BinaryToString(LPBYTE pBuffer, DWORD dwSize, CStringW& strBinStr);
	BOOL StringToBinary(CStringW& strBinStr, LPBYTE pBuffer, DWORD dwSize);

private:
	CStringW m_strCurrentAppName;
	std::map<CStringW, std::map<CStringW, CStringW>> m_mapIniData;
};

#endif