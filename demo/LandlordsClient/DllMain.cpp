#include "stdafx.h"
#include "GameObserverImp.h"
#include "..\Include\kis_com_s\kis_com\kiscom.h"

KAS_BEGIN_OBJECT_MAP()
KAS_OBJECT_ENTRY(IGameObserver, CGameObserverImp)
KAS_END_OBJECT_MAP()

USE_DEFAULT_COM_PROC


BOOL APIENTRY DllMain(HMODULE hModule, DWORD dwReason, LPVOID lpReserved)
{
    switch (dwReason)
    {
    case DLL_PROCESS_ATTACH:
        ::DisableThreadLibraryCalls((HMODULE)hModule);
        break;

    case DLL_PROCESS_DETACH:
        break;

    default:
        break;
    }

    return TRUE;
}
